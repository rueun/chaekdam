import type { Discussion } from '@/lib/domain/discussion/discussion';
import { Persona } from '@/lib/domain/persona/persona';
import { BookNotFoundError, DiscussionNotFoundError } from '@/lib/domain/shared/errors';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import type { AiDiscussionPartner } from '@/lib/domain/ports/ai-discussion-partner';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 토론 이어가기 명령 — 방 + 사용자 발화. */
export interface ContinueDiscussionCommand {
  discussionId: string;
  content: string;
}

/**
 * 토론 이어가기 유스케이스 — 사용자 발화를 더하고 AI 응답을 받아 저장한다.
 * 트랜잭션 경계 = Discussion Aggregate. Port 만 의존.
 * books·highlights 는 AI 컨텍스트(책 메타·시드 한 줄) 구성 전용.
 * AI/기술 오류(`AiDiscussionPartner.respond`)는 호출자(진입점)가 처리한다.
 */
export class ContinueDiscussionUseCase {
  constructor(
    private readonly discussions: DiscussionRepository,
    private readonly ai: AiDiscussionPartner,
    private readonly books: BookRepository,
    private readonly highlights: HighlightRepository,
  ) {}

  async execute(command: ContinueDiscussionCommand): Promise<Discussion> {
    const room = await this.discussions.findById(command.discussionId);
    if (!room) throw new DiscussionNotFoundError(command.discussionId);

    // 책·시드 한 줄은 서로 독립이라 병렬 조회.
    const [book, seedHighlight] = await Promise.all([
      this.books.findById(room.bookId),
      room.seedHighlightId ? this.highlights.findById(room.seedHighlightId) : null,
    ]);
    if (!book) throw new BookNotFoundError(room.bookId);

    // 사용자 발화를 먼저 더한 뒤(이력에 포함) AI 응답을 요청한다.
    const withUser = room.addUserMessage(command.content);
    const aiText = await this.ai.respond({
      persona: Persona.of(room.personaKey),
      book: { title: book.title, author: book.author },
      seedHighlight: seedHighlight?.content ?? null,
      history: withUser.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const continued = withUser.addAiMessage(aiText);
    await this.discussions.save(continued);
    return continued;
  }
}

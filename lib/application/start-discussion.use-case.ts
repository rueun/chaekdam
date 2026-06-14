import { Discussion } from '@/lib/domain/discussion/discussion';
import { Persona, type PersonaKey } from '@/lib/domain/persona/persona';
import { BookNotFoundError } from '@/lib/domain/shared/errors';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import type { AiDiscussionPartner } from '@/lib/domain/ports/ai-discussion-partner';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';

/** 토론 시작 명령 — 책+페르소나(+선택 시드 한 줄). */
export interface StartDiscussionCommand {
  bookId: string;
  personaKey: PersonaKey;
  seedHighlightId?: string | null;
}

/**
 * 토론 시작 유스케이스 — 방을 만들고 첫 AI 발화까지 포함해 저장한다(시작 시 첫 응답 포함).
 * 트랜잭션 경계 = Discussion Aggregate. Port 만 의존(구현체 모름).
 * AI/기술 오류(`AiDiscussionPartner.respond`)는 도메인 예외로 감싸지 않고 호출자(진입점)가 처리한다.
 */
export class StartDiscussionUseCase {
  constructor(
    private readonly discussions: DiscussionRepository,
    private readonly ai: AiDiscussionPartner,
    private readonly books: BookRepository,
    private readonly highlights: HighlightRepository,
  ) {}

  async execute(command: StartDiscussionCommand): Promise<Discussion> {
    // 책·시드 한 줄은 서로 독립이라 병렬 조회(슬라이스 3 Supabase RTT 절감).
    const [book, seedHighlight] = await Promise.all([
      this.books.findById(command.bookId),
      command.seedHighlightId ? this.highlights.findById(command.seedHighlightId) : null,
    ]);
    if (!book) throw new BookNotFoundError(command.bookId);

    // 시드 한 줄: 지정됐고 실제로 존재할 때만 사용(삭제됐으면 시드 없이 진행 — FK 안전).
    const seedHighlightId = seedHighlight?.id ?? null;
    const seedContent = seedHighlight?.content ?? null;

    // Discussion.start 가 페르소나 가용성을 강제한다(작가 본인 보류 등).
    const room = Discussion.start({
      bookId: command.bookId,
      personaKey: command.personaKey,
      seedHighlightId,
      title: Discussion.titleFromSeed(seedContent),
    });

    const opening = await this.ai.respond({
      persona: Persona.of(command.personaKey),
      book: { title: book.title, author: book.author },
      seedHighlight: seedContent,
      history: [],
    });

    const started = room.addAiMessage(opening);
    await this.discussions.save(started);
    return started;
  }
}

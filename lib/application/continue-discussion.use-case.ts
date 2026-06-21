import type { Discussion } from '@/lib/domain/discussion/discussion';
import { Persona } from '@/lib/domain/persona/persona';
import { BookNotFoundError } from '@/lib/domain/shared/errors';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import type { AiDiscussionPartner } from '@/lib/domain/ports/ai-discussion-partner';
import type { BookRepository } from '@/lib/domain/ports/book-repository';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { loadOwnedDiscussion } from './discussion-ownership';

/** 토론 이어가기 명령 — 방 + 사용자 발화. userId 로 소유권을 검증한다(ADR-027). */
export interface ContinueDiscussionCommand {
  discussionId: string;
  userId: string;
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
    // 소유권 검증(ADR-027) — 없으면 NotFound, 타인 방이면 AccessDenied.
    const room = await loadOwnedDiscussion(this.discussions, command.discussionId, command.userId);

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

  /**
   * 토론 이어가기(스트리밍) — AI 텍스트 델타를 도착하는 대로 yield 하고,
   * 스트림이 정상 종료되면 사용자+AI 메시지를 함께 저장한다(Aggregate 트랜잭션 1개).
   * 스트림 중단·실패 시 저장하지 않으므로 부분 응답이 남지 않는다(사용자 재시도 가능).
   */
  async *executeStreaming(command: ContinueDiscussionCommand): AsyncGenerator<string> {
    // 소유권 검증(ADR-027) — 스트림 시작 전에 NotFound/AccessDenied 를 던진다.
    const room = await loadOwnedDiscussion(this.discussions, command.discussionId, command.userId);

    const [book, seedHighlight] = await Promise.all([
      this.books.findById(room.bookId),
      room.seedHighlightId ? this.highlights.findById(room.seedHighlightId) : null,
    ]);
    if (!book) throw new BookNotFoundError(room.bookId);

    const withUser = room.addUserMessage(command.content);
    let full = '';
    const stream = this.ai.respondStream({
      persona: Persona.of(room.personaKey),
      book: { title: book.title, author: book.author },
      seedHighlight: seedHighlight?.content ?? null,
      history: withUser.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const delta of stream) {
      full += delta;
      yield delta;
    }

    const aiText = full.trim();
    if (!aiText) throw new Error('AI partner returned an empty stream');
    await this.discussions.save(withUser.addAiMessage(aiText));
  }
}

import type {
  AiDiscussionPartner,
  DiscussionContext,
} from '@/lib/domain/ports/ai-discussion-partner';

/**
 * 테스트용 Fake AI 토론 상대 — 실제 Claude 대신 결정적 응답을 낸다(testing 규칙: 외부 AI 는 Fake 허용).
 * 컨텍스트(페르소나·이력 길이)를 반영해 검증 가능한 텍스트를 만든다.
 */
export class FakeAiDiscussionPartner implements AiDiscussionPartner {
  /** 전달받은 컨텍스트를 검사용으로 보관(마지막 호출). */
  lastContext: DiscussionContext | null = null;

  /**
   * @param failAfterDeltas null 이 아니면, 스트리밍이 이 개수만큼 델타를 흘린 뒤 실패한다
   *   (스트림 중단 시 미저장 보장을 검증하기 위한 옵션).
   */
  constructor(private readonly failAfterDeltas: number | null = null) {}

  // 동기 Fake 라 async 대신 Promise.resolve 로 Port 시그니처(Promise 반환)를 만족한다.
  respond(context: DiscussionContext): Promise<string> {
    this.lastContext = context;
    return Promise.resolve(this.textFor(context));
  }

  /** 스트리밍 Fake — 전체 텍스트를 어절 단위 델타로 쪼개 흘려보낸다(누적 검증 가능). */
  async *respondStream(context: DiscussionContext): AsyncIterable<string> {
    this.lastContext = context;
    await Promise.resolve(); // 실제 어댑터처럼 비동기 경계를 두어 AsyncIterable 시그니처를 만족
    let emitted = 0;
    for (const chunk of this.textFor(context).split(/(?<=\s)/)) {
      if (this.failAfterDeltas !== null && emitted >= this.failAfterDeltas) {
        throw new Error('Fake AI stream failed');
      }
      yield chunk;
      emitted += 1;
    }
  }

  private textFor(context: DiscussionContext): string {
    return context.history.length === 0
      ? `[${context.persona.name}] 여는 말`
      : `[${context.persona.name}] 응답 ${context.history.length}`;
  }
}

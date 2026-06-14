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

  // 동기 Fake 라 async 대신 Promise.resolve 로 Port 시그니처(Promise 반환)를 만족한다.
  respond(context: DiscussionContext): Promise<string> {
    this.lastContext = context;
    const text =
      context.history.length === 0
        ? `[${context.persona.name}] 여는 말`
        : `[${context.persona.name}] 응답 ${context.history.length}`;
    return Promise.resolve(text);
  }
}

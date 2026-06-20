import type { Persona } from '@/lib/domain/persona/persona';
import type { Role } from '@/lib/domain/discussion/role';

/** 한 발화(어댑터에 넘기는 대화 이력 단위) */
export interface DiscussionTurn {
  role: Role;
  content: string;
}

/** AI 응답 생성에 필요한 컨텍스트. */
export interface DiscussionContext {
  /** 페르소나(톤) */
  persona: Persona;
  /** 책 메타(시스템 프롬프트용) — MVP는 제목·저자만 */
  book: { title: string; author: string };
  /** 첫 턴을 여는 시드 한 줄(없으면 null) */
  seedHighlight: string | null;
  /** 지금까지의 대화 이력. 비어 있으면 여는 말을 생성한다. */
  history: DiscussionTurn[];
}

/**
 * AI 토론 상대 Port — 도메인이 정의하는 AI 응답 계약(ADR-005).
 * 구현(Adapter)은 Infrastructure 에서 제공한다(ClaudeAiDiscussionPartner).
 * 도메인·유스케이스는 LLM 구현을 모른다(교체 가능).
 */
export interface AiDiscussionPartner {
  /** 컨텍스트로부터 다음 발화를 생성한다(완성 텍스트, 비스트리밍). */
  respond(context: DiscussionContext): Promise<string>;

  /**
   * 컨텍스트로부터 다음 발화를 생성하되 텍스트 조각(델타)을 점진적으로 흘려보낸다.
   * AsyncIterable 은 표준 JS 라 도메인 순수성을 해치지 않는다(프레임워크 비의존).
   */
  respondStream(context: DiscussionContext): AsyncIterable<string>;
}

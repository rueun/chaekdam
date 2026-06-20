/**
 * AI 토론 페르소나 — 톤·관점 아키타입(ADR-009). 시스템 큐레이션 정적 데이터라
 * 별도 저장소 없이 코드 상수로 둔다(ADR-015). 사용자가 만들지 않는다.
 *
 * `tone` 은 어댑터가 시스템 프롬프트에 끼워 넣는 페르소나별 지침이다(책 메타·공통 지침은 어댑터 책임).
 */
import { Author } from '@/lib/domain/author/author';

export type PersonaKey = 'socrates' | 'critic' | 'author' | 'friend';

export class Persona {
  private constructor(
    readonly key: PersonaKey,
    readonly name: string,
    readonly tone: string,
    /** 작가 본인 페르소나처럼 사망(저작권 만료) 작가에게만 허용되는지 */
    readonly requiresDeceasedAuthor: boolean,
  ) {
    Object.freeze(this);
  }

  /** 4 아키타입 정의. author 는 정의만 두고 MVP 가용 목록에선 제외(ADR-015). */
  private static readonly REGISTRY: Record<PersonaKey, Persona> = {
    socrates: new Persona(
      'socrates',
      '소크라테스',
      '답을 주지 말고 질문으로 사고를 끌어낸다. 한 번에 하나의 열린 질문만 던지고, 요약·결론·평가는 하지 않는다. 독자가 스스로 깨닫도록 부드럽게 되묻는다.',
      false,
    ),
    critic: new Persona(
      'critic',
      '비평가',
      '구조·문체·표현·당대 맥락을 근거를 들어 분석한다. 단정적이되 차분하게, 텍스트의 구체적 부분을 짚어 통찰을 제시한다.',
      false,
    ),
    author: new Persona(
      'author',
      '작가 본인',
      '작품을 쓴 사람의 목소리로, 인터뷰·서신·산문의 톤으로 말한다. 창작 의도와 감정을 1인칭으로 들려준다.',
      true,
    ),
    friend: new Persona(
      'friend',
      '책 동무',
      '분석하지 않고 함께 읽는 친구처럼 공감하고 반응한다. 편안한 구어체로, 같은 구절에서 느낀 감정을 나눈다.',
      false,
    ),
  };

  /**
   * 가용 페르소나(표시 순서). 작가 본인은 '사망 작가' 책에 한해 쓸 수 있고(ADR-022),
   * 책별 제약은 StartDiscussion 이 Author 로 검증한다(여기선 선택 가능 목록만). 동결.
   */
  private static readonly AVAILABLE: readonly PersonaKey[] = Object.freeze([
    'socrates',
    'critic',
    'author',
    'friend',
  ]);

  /** 키로 페르소나를 얻는다. */
  static of(key: PersonaKey): Persona {
    return Persona.REGISTRY[key];
  }

  /** 현재 선택 가능한 페르소나 키 목록(표시 순서). 호출자가 변경하지 못하도록 readonly. */
  static availableKeys(): readonly PersonaKey[] {
    return Persona.AVAILABLE;
  }

  /** 토론 생성에 사용할 수 있는 페르소나인지. */
  static isAvailable(key: PersonaKey): boolean {
    return Persona.AVAILABLE.includes(key);
  }

  /**
   * 이 페르소나로 해당 작가의 책을 토론할 수 있는지(정보 전문가).
   * 작가 본인 페르소나는 사망 작가에 한해 허용한다(ADR-022).
   */
  canDiscussBookBy(authorName: string): boolean {
    return !this.requiresDeceasedAuthor || Author.isDeceased(authorName);
  }
}

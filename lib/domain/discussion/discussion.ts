import { generateId } from '@/lib/domain/shared/id';
import { PersonaNotAvailableError } from '@/lib/domain/shared/errors';
import { Persona, type PersonaKey } from '@/lib/domain/persona/persona';
import { Message } from './message';

/**
 * 토론(Discussion) — Aggregate Root. 책+페르소나로 고정된 대화 방이며,
 * 한 줄(seedHighlightId)은 첫 턴을 여는 선택 시드다(ADR-015). 책당 여러 방을 둘 수 있다.
 *
 * 불변 객체. 정적 팩토리(`start`/`restore`)로만 만들고, 메시지 추가는 새 인스턴스를 반환한다.
 * 페르소나는 생성 후 변경되지 않는다. 다른 Aggregate(Book/Highlight)는 ID 로만 참조한다.
 */
export class Discussion {
  private constructor(
    readonly id: string,
    readonly bookId: string,
    readonly personaKey: PersonaKey,
    readonly seedHighlightId: string | null,
    readonly title: string | null,
    readonly messages: readonly Message[],
    readonly createdAt: Date,
  ) {
    // 배열 원소 변경(push/pop)까지 막으려면 참조 대상도 별도 동결해야 한다(this 동결은 얕음).
    Object.freeze(this.messages);
    Object.freeze(this);
  }

  /** 새 토론 방을 연다. 가용하지 않은 페르소나면 거부한다(작가 본인 보류 등, ADR-015). */
  static start(props: {
    bookId: string;
    personaKey: PersonaKey;
    seedHighlightId?: string | null;
    title?: string | null;
  }): Discussion {
    if (!Persona.isAvailable(props.personaKey)) {
      throw new PersonaNotAvailableError(props.personaKey);
    }
    return new Discussion(
      generateId(),
      props.bookId,
      props.personaKey,
      props.seedHighlightId ?? null,
      props.title ?? null,
      [],
      new Date(),
    );
  }

  /** 사용자 발화를 더한 새 토론을 반환한다(원본 불변). */
  addUserMessage(content: string): Discussion {
    return this.append(Message.fromUser(this.id, content));
  }

  /** AI 발화를 더한 새 토론을 반환한다(원본 불변). */
  addAiMessage(content: string): Discussion {
    return this.append(Message.fromAi(this.id, content));
  }

  /**
   * 메시지를 더한 새 토론을 반환한다(원본 불변).
   * Aggregate Root 가 자기 메시지를 직접 만들어(discussionId = this.id) 정합성을 보장한다.
   */
  private append(message: Message): Discussion {
    return new Discussion(
      this.id,
      this.bookId,
      this.personaKey,
      this.seedHighlightId,
      this.title,
      [...this.messages, message],
      this.createdAt,
    );
  }

  /** 저장소에서 읽어온 상태로 복원한다(Repository 전용). 저장된 값을 신뢰한다. */
  static restore(props: {
    id: string;
    bookId: string;
    personaKey: PersonaKey;
    seedHighlightId: string | null;
    title: string | null;
    messages: readonly Message[];
    createdAt: Date;
  }): Discussion {
    return new Discussion(
      props.id,
      props.bookId,
      props.personaKey,
      props.seedHighlightId,
      props.title,
      [...props.messages],
      props.createdAt,
    );
  }

  /** 발화 수(턴). */
  get messageCount(): number {
    return this.messages.length;
  }

  /** 마지막 발화. 없으면 null. */
  get lastMessage(): Message | null {
    return this.messages.at(-1) ?? null;
  }
}

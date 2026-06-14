import { generateId } from '@/lib/domain/shared/id';
import { EmptyMessageContentError, MessageContentTooLongError } from '@/lib/domain/shared/errors';
import { Role } from './role';

/** 메시지 본문 최대 길이(저장소 컬럼과 일치) */
export const MESSAGE_CONTENT_MAX_LENGTH = 8000;

/**
 * 토론 발화(Message) — Discussion Aggregate 내부 엔티티.
 *
 * 불변 객체(모든 필드 readonly + 동결). 정적 팩토리(`fromUser`/`fromAi`/`restore`)로만 만든다.
 * 불변식(본문 비어있지 않음·길이 제한)은 생성 시 강제한다.
 */
export class Message {
  private constructor(
    readonly id: string,
    readonly discussionId: string,
    readonly role: Role,
    readonly content: string,
    readonly createdAt: Date,
  ) {
    Object.freeze(this);
  }

  /** 사용자 발화. */
  static fromUser(discussionId: string, content: string): Message {
    return new Message(
      generateId(),
      discussionId,
      Role.USER,
      normalizeContent(content),
      new Date(),
    );
  }

  /** AI 발화. */
  static fromAi(discussionId: string, content: string): Message {
    return new Message(generateId(), discussionId, Role.AI, normalizeContent(content), new Date());
  }

  /**
   * 저장소에서 읽어온 상태로 복원한다(Repository 전용). 본문은 저장 시 검증됐으므로 신뢰한다.
   * Message 는 필드 간 교차 구조 불변식이 없어(role·content 조합 규칙 없음) 복원 시 재검증할 게 없다
   * (Highlight/ReadingSession restore 의 구조 불변식 재검증과 달리).
   */
  static restore(props: {
    id: string;
    discussionId: string;
    role: Role;
    content: string;
    createdAt: Date;
  }): Message {
    return new Message(props.id, props.discussionId, props.role, props.content, props.createdAt);
  }
}

/**
 * 본문 정규화 + 불변식 검증(앞뒤 공백 제거, 비어있음·길이 제한).
 * 길이는 UTF-16 코드 유닛 기준(`String.length`) — 저장소 컬럼 상한과 맞추기 위함이며,
 * 사용자가 보는 글자 수와 미세하게 다를 수 있다(이모지 등). Highlight 와 동일 정책.
 */
function normalizeContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new EmptyMessageContentError();
  if (trimmed.length > MESSAGE_CONTENT_MAX_LENGTH) {
    throw new MessageContentTooLongError(MESSAGE_CONTENT_MAX_LENGTH);
  }
  return trimmed;
}

import type { Discussion } from '@/lib/domain/discussion/discussion';
import { Role } from '@/lib/domain/discussion/role';
import type { Message } from '@/lib/domain/discussion/message';

/** 채팅 UI 로 넘기는 직렬화 메시지 뷰(도메인 Message → plain). */
export interface MessageView {
  id: string;
  who: 'me' | 'ai';
  body: string;
}

export function toMessageView(message: Message): MessageView {
  return { id: message.id, who: message.role === Role.AI ? 'ai' : 'me', body: message.content };
}

/** 한 토론의 메시지들을 채팅 뷰 배열로 변환한다. */
export function toThread(discussion: Discussion): MessageView[] {
  return discussion.messages.map(toMessageView);
}

'use server';

import { revalidatePath } from 'next/cache';
import { createAuthSession, createStartDiscussionUseCase } from '@/lib/infrastructure/di-container';
import type { PersonaKey } from '@/lib/domain/persona/persona';
import {
  AuthorPersonaUnavailableError,
  DiscussionNotFoundError,
  PersonaNotAvailableError,
} from '@/lib/domain/shared/errors';
import {
  toMessageView,
  type MessageView,
} from '@/components/feature/discussion-chat/discussion-view';
import { ROUTES } from '@/lib/router/routes';

/** 사용자에게 보일 실패 메시지(도메인 예외 → 한국어). */
function toUserError(error: unknown): string {
  if (error instanceof AuthorPersonaUnavailableError)
    return '작가 본인과의 대화는 사망한 작가의 책에서만 열 수 있어요.';
  if (error instanceof PersonaNotAvailableError) return '지금은 선택할 수 없는 토론자예요.';
  if (error instanceof DiscussionNotFoundError) return '대화를 찾을 수 없어요.';
  // AI 호출 실패(키 누락·네트워크·API 오류 등)
  return 'AI 응답에 실패했어요. 잠시 후 다시 시도해 주세요.';
}

export type StartDiscussionResult =
  | { ok: true; discussionId: string; title: string | null; messages: MessageView[] }
  | { ok: false; error: string };

/** 새 토론 시작 — 방 생성 + 첫 AI 응답. */
export async function startDiscussion(input: {
  bookId: string;
  personaKey: PersonaKey;
  seedHighlightId?: string | null;
}): Promise<StartDiscussionResult> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return { ok: false, error: '로그인이 필요해요.' };

  try {
    const useCase = await createStartDiscussionUseCase();
    const room = await useCase.execute({ ...input, userId });
    revalidatePath(ROUTES.DISCUSSIONS.LIST());
    return {
      ok: true,
      discussionId: room.id,
      title: room.title,
      messages: room.messages.map(toMessageView),
    };
  } catch (error) {
    console.error('Failed to start discussion', error);
    return { ok: false, error: toUserError(error) };
  }
}

// 토론 이어가기(AI 응답 스트리밍)는 Server Action 으로 표현 못 해 Route Handler 로 옮겼다(ADR-017).
// → app/api/discussions/[id]/stream/route.ts

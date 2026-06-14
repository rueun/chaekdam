'use server';

import { revalidatePath } from 'next/cache';
import {
  createAuthSession,
  createCaptureHighlightUseCase,
  createDeleteHighlightUseCase,
} from '@/lib/infrastructure/di-container';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import { DomainError } from '@/lib/domain/shared/errors';
import { ROUTES } from '@/lib/router/routes';

export interface CaptureHighlightInput {
  bookId: string;
  content: string;
  page?: string | null;
}

export type CaptureHighlightResult = { ok: true } | { ok: false; error: string };

/**
 * 한 줄 담기 — 얇은 어댑터. 입력을 유스케이스로 넘겨 저장한다.
 * 사진 업로드(PhotoStorage)는 후속이라 현재는 검토한 텍스트(TEXT)로 저장한다.
 */
export async function captureHighlight(
  input: CaptureHighlightInput,
): Promise<CaptureHighlightResult> {
  try {
    // 진입점 인가 게이트 — 미들웨어·RLS 외에 진입점에서도 1차 방어
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createCaptureHighlightUseCase();
    await useCase.execute({
      source: NoteSource.TEXT,
      bookId: input.bookId,
      content: input.content,
      page: input.page ?? null,
    });
    revalidatePath(ROUTES.HIGHLIGHTS());
    return { ok: true };
  } catch (error) {
    // 도메인 불변식 위반(빈 본문 등)은 사용자 메시지로, 그 외는 일반 실패로
    return {
      ok: false,
      error: error instanceof DomainError ? '문장을 확인해 주세요.' : '저장에 실패했어요.',
    };
  }
}

export type DeleteHighlightResult = { ok: true } | { ok: false; error: string };

/** 담은 한 줄을 삭제한다 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function deleteHighlight(highlightId: string): Promise<DeleteHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createDeleteHighlightUseCase();
    await useCase.execute(highlightId);
    // 한 줄이 보이는 화면 갱신(현재 화면은 클라이언트 router.refresh 가 처리).
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    console.error('Failed to delete highlight', error);
    return { ok: false, error: '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

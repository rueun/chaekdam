'use server';

import { revalidatePath } from 'next/cache';
import {
  createAuthSession,
  createRemoveBookFromShelfUseCase,
  createSetBookStatusUseCase,
} from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { BookAccessDeniedError, BookNotFoundError } from '@/lib/domain/shared/errors';
import { ROUTES } from '@/lib/router/routes';

export type WishlistActionResult = { ok: true } | { ok: false; error: string };

/** 없거나 타인 책이면 동일 메시지(존재 여부 비노출, ADR-027). */
function isMissingOrForeign(error: unknown): boolean {
  return error instanceof BookNotFoundError || error instanceof BookAccessDeniedError;
}

/** 지금부터 읽기 — 위시 책을 '읽는 중'으로 상태 전이. */
export async function startReading(bookId: string): Promise<WishlistActionResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createSetBookStatusUseCase();
    await useCase.execute({ bookId, userId, status: BookStatus.READING });

    revalidatePath(ROUTES.WISHLIST());
    revalidatePath(ROUTES.LIBRARY());
    revalidatePath(ROUTES.READING());
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: isMissingOrForeign(error) ? '책을 찾을 수 없어요.' : '처리에 실패했어요.',
    };
  }
}

/** 위시리스트에서 빼기 — 책을 책장에서 제거. */
export async function removeFromWishlist(bookId: string): Promise<WishlistActionResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createRemoveBookFromShelfUseCase();
    await useCase.execute(bookId, userId);

    revalidatePath(ROUTES.WISHLIST());
    revalidatePath(ROUTES.LIBRARY());
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: isMissingOrForeign(error) ? '책을 찾을 수 없어요.' : '빼기에 실패했어요.',
    };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import {
  createAddBookToShelfUseCase,
  createAuthSession,
  createListBooksUseCase,
} from '@/lib/infrastructure/di-container';
import { addBookSchema, type AddBookInput } from '@/lib/application/book/schemas';
import { toDomainBookStatus } from '@/components/feature/library/book-status-map';
import { ROUTES } from '@/lib/router/routes';

export type { AddBookInput };

export type AddBookResult = { ok: true; bookId: string } | { ok: false; error: string };

/** 책을 책장에 담는다 — 얇은 어댑터(인가 게이트 + 입력 검증 → 유스케이스). */
export async function addBook(input: AddBookInput): Promise<AddBookResult> {
  const parsed = addBookSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? '책 정보를 확인해 주세요.' };
  }

  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createAddBookToShelfUseCase();
    const { bookId } = await useCase.execute({
      title: parsed.data.title,
      author: parsed.data.author,
      status: toDomainBookStatus(parsed.data.status),
      coverColor: parsed.data.coverColor ?? null,
    });

    revalidatePath(ROUTES.LIBRARY());
    revalidatePath(ROUTES.WISHLIST());
    return { ok: true, bookId };
  } catch {
    return { ok: false, error: '담기에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

export interface BookOption {
  id: string;
  /** '제목 · 저자' 표시 라벨 */
  label: string;
}

/** 캡처 등에서 책을 고를 때 쓰는 현재 사용자의 책장 목록(최신순). */
export async function listMyBookOptions(): Promise<BookOption[]> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return [];
  const books = await (await createListBooksUseCase()).execute();
  return books.map((b) => ({ id: b.id, label: b.author ? `${b.title} · ${b.author}` : b.title }));
}

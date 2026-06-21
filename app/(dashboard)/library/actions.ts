'use server';

import { revalidatePath } from 'next/cache';
import {
  createAddBookToShelfUseCase,
  createAuthSession,
  createListBooksUseCase,
  createSearchBooksUseCase,
} from '@/lib/infrastructure/di-container';
import { addBookSchema, type AddBookInput } from '@/lib/application/book/schemas';
import type { BookSearchHit } from '@/lib/domain/ports/book-searcher';
import { toDomainBookStatus } from '@/components/feature/library/book-status-map';
import { ownedBookKey } from '@/lib/book-key';
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
      userId,
      title: parsed.data.title,
      author: parsed.data.author,
      status: toDomainBookStatus(parsed.data.status),
      coverColor: parsed.data.coverColor ?? null,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
    });

    revalidatePath(ROUTES.LIBRARY());
    revalidatePath(ROUTES.WISHLIST());
    return { ok: true, bookId };
  } catch {
    return { ok: false, error: '담기에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

export type { BookSearchHit };

export type SearchBooksResult =
  | { ok: true; results: BookSearchHit[] }
  | { ok: false; error: string };

/** 외부 카탈로그(네이버)에서 도서를 검색한다 — 키는 서버 전용. 빈 질의어는 빈 결과. */
export async function searchBooks(query: string): Promise<SearchBooksResult> {
  const trimmed = query.trim();
  if (!trimmed) return { ok: true, results: [] };

  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createSearchBooksUseCase();
    const results = await useCase.execute(trimmed);
    return { ok: true, results };
  } catch (error) {
    console.error('Failed to search books', error);
    return { ok: false, error: '검색에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

export interface BookOption {
  id: string;
  /** '제목 · 저자' 표시 라벨 */
  label: string;
}

/** 현재 사용자가 이미 보유한 책의 키(제목+저자) 목록 — 검색 결과의 '이미 담음' 표시용. */
export async function listOwnedBookKeys(): Promise<string[]> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return [];
  const books = await (await createListBooksUseCase()).execute(userId);
  return books.map((b) => ownedBookKey(b.title, b.author));
}

/** 캡처 등에서 책을 고를 때 쓰는 현재 사용자의 책장 목록(최신순). */
export async function listMyBookOptions(): Promise<BookOption[]> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return [];
  const books = await (await createListBooksUseCase()).execute(userId);
  return books.map((b) => ({ id: b.id, label: b.author ? `${b.title} · ${b.author}` : b.title }));
}

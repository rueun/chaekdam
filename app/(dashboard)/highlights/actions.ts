'use server';

import { revalidatePath } from 'next/cache';
import {
  createAuthSession,
  createCaptureHighlightUseCase,
  createCaptureHighlightFromPhotoUseCase,
  createDeleteHighlightUseCase,
  createEditHighlightUseCase,
  createMoveHighlightUseCase,
  createPinHighlightUseCase,
  createArchiveHighlightUseCase,
  createExtractHighlightFromPhotoUseCase,
} from '@/lib/infrastructure/di-container';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import { DomainError } from '@/lib/domain/shared/errors';
import type { HighlightScope } from '@/lib/application/list-highlights.use-case';
import type { HighlightView } from '@/components/feature/highlight/highlight-card';
import { HIGHLIGHTS_PAGE_SIZE, loadHighlightViews } from './load-highlight-views';
import { ROUTES } from '@/lib/router/routes';

/** data URL(`data:image/...;base64,...`) → MIME + base64 분리. 형식이 아니면 null. */
function parseImageDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1]!, base64: match[2]! };
}

// base64 길이 상한(약 4MB) — Server Action 본문 한도(next.config bodySizeLimit '4mb')와 정합.
// 한도 초과 시 Next 의 413 대신 친절한 메시지를 먼저 돌려준다. 클라이언트는 다운스케일 후 전송.
const MAX_BASE64_LENGTH = 4_000_000;

export interface CaptureHighlightInput {
  bookId: string;
  content: string;
  page?: string | null;
  /** 사진 원본(다운스케일된 data URL). 있으면 원본을 저장하고 PHOTO 출처로 남긴다(ADR-020). */
  photoDataUrl?: string | null;
  /** 자유 입력 태그(ADR-023) */
  tags?: string[];
}

export type CaptureHighlightResult = { ok: true } | { ok: false; error: string };

/**
 * 한 줄 담기 — 얇은 어댑터. 사진(photoDataUrl)이 있으면 원본을 저장하고 PHOTO 출처로,
 * 없으면 검토한 텍스트(TEXT)로 저장한다. 비즈니스 로직은 유스케이스에 위임.
 */
export async function captureHighlight(
  input: CaptureHighlightInput,
): Promise<CaptureHighlightResult> {
  try {
    // 진입점 인가 게이트 — 미들웨어·RLS 외에 진입점에서도 1차 방어
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    if (input.photoDataUrl) {
      const parsed = parseImageDataUrl(input.photoDataUrl);
      if (!parsed) return { ok: false, error: '이미지를 읽을 수 없어요.' };
      if (parsed.base64.length > MAX_BASE64_LENGTH) {
        return { ok: false, error: '이미지가 너무 커요. 더 작은 사진으로 시도해 주세요.' };
      }
      const photoUseCase = await createCaptureHighlightFromPhotoUseCase();
      await photoUseCase.execute({
        userId,
        bookId: input.bookId,
        content: input.content,
        image: { base64: parsed.base64, mediaType: parsed.mediaType },
        page: input.page ?? null,
        tags: input.tags ?? [],
      });
    } else {
      const useCase = await createCaptureHighlightUseCase();
      await useCase.execute({
        source: NoteSource.TEXT,
        userId,
        bookId: input.bookId,
        content: input.content,
        page: input.page ?? null,
        tags: input.tags ?? [],
      });
    }
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

/**
 * 한 줄 '더보기' — offset 부터 한 페이지를 더 불러온다(ADR-025). 태그 필터 없는 목록 전용.
 * 미인증이면 빈 배열(클라이언트는 더 이상 불러올 게 없다고 본다).
 */
export async function loadMoreHighlights(
  scope: HighlightScope,
  offset: number,
): Promise<HighlightView[]> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return [];
  return loadHighlightViews(userId, scope, {
    limit: HIGHLIGHTS_PAGE_SIZE,
    offset: Math.max(0, offset),
  });
}

export type EditHighlightResult = { ok: true } | { ok: false; error: string };

/** 한 줄 수정 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function editHighlight(input: {
  highlightId: string;
  content: string;
  page?: string | null;
  tags?: string[];
}): Promise<EditHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const trimmed = input.content.trim();
    if (!trimmed) return { ok: false, error: '문장을 입력해 주세요.' };

    const useCase = await createEditHighlightUseCase();
    await useCase.execute({
      highlightId: input.highlightId,
      userId,
      content: trimmed,
      page: input.page ?? null,
      tags: input.tags,
    });
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof DomainError ? '문장을 확인해 주세요.' : '수정에 실패했어요.',
    };
  }
}

export type MoveHighlightResult = { ok: true } | { ok: false; error: string };

/** 한 줄을 다른 책으로 이동 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function moveHighlight(input: {
  highlightId: string;
  bookId: string;
}): Promise<MoveHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };
    if (!input.bookId) return { ok: false, error: '옮길 책을 선택해 주세요.' };

    const useCase = await createMoveHighlightUseCase();
    await useCase.execute({ highlightId: input.highlightId, userId, bookId: input.bookId });
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof DomainError ? '옮길 책을 확인해 주세요.' : '이동에 실패했어요.',
    };
  }
}

export type PinHighlightResult = { ok: true } | { ok: false; error: string };

/** 한 줄 고정/해제 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function pinHighlight(
  highlightId: string,
  pinned: boolean,
): Promise<PinHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createPinHighlightUseCase();
    await useCase.execute({ highlightId, userId, pinned });
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    console.error('Failed to pin highlight', error);
    return { ok: false, error: '잠시 후 다시 시도해 주세요.' };
  }
}

export type ArchiveHighlightResult = { ok: true } | { ok: false; error: string };

/** 한 줄 보관/해제 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function archiveHighlight(
  highlightId: string,
  archived: boolean,
): Promise<ArchiveHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createArchiveHighlightUseCase();
    await useCase.execute({ highlightId, userId, archived });
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    console.error('Failed to archive highlight', error);
    return { ok: false, error: '잠시 후 다시 시도해 주세요.' };
  }
}

export type ExtractHighlightResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * 사진 → 구절 추출 — 얇은 어댑터. data URL 을 검증해 Vision 유스케이스로 넘긴다.
 * 추출 텍스트는 사용자가 검토·수정 후 captureHighlight 로 저장한다(저장과 분리).
 */
export async function extractHighlightFromImage(dataUrl: string): Promise<ExtractHighlightResult> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return { ok: false, error: '로그인이 필요해요.' };

  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) return { ok: false, error: '이미지를 읽을 수 없어요.' };
  if (parsed.base64.length > MAX_BASE64_LENGTH) {
    return { ok: false, error: '이미지가 너무 커요. 더 작은 사진으로 시도해 주세요.' };
  }

  try {
    const useCase = await createExtractHighlightFromPhotoUseCase();
    const text = await useCase.execute({ base64: parsed.base64, mediaType: parsed.mediaType });
    return { ok: true, text };
  } catch (error) {
    console.error('Failed to extract highlight from image', error);
    return { ok: false, error: '구절 추출에 실패했어요. 직접 입력해 주세요.' };
  }
}

export type DeleteHighlightResult = { ok: true } | { ok: false; error: string };

/** 담은 한 줄을 삭제한다 — 얇은 어댑터(인가 게이트 → 유스케이스). */
export async function deleteHighlight(highlightId: string): Promise<DeleteHighlightResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createDeleteHighlightUseCase();
    await useCase.execute(highlightId, userId);
    // 한 줄이 보이는 화면 갱신(현재 화면은 클라이언트 router.refresh 가 처리).
    revalidatePath(ROUTES.HIGHLIGHTS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    console.error('Failed to delete highlight', error);
    return { ok: false, error: '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

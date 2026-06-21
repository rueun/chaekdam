'use server';

import { revalidatePath } from 'next/cache';
import {
  createAuthSession,
  createLogReadingSessionUseCase,
} from '@/lib/infrastructure/di-container';
import {
  DomainError,
  InvalidPageRangeError,
  InvalidSessionMinutesError,
} from '@/lib/domain/shared/errors';
import { ROUTES } from '@/lib/router/routes';

export interface LogReadingSessionInput {
  bookId: string;
  minutes: number;
  startPage?: number | null;
  endPage?: number | null;
}

export type LogReadingSessionResult = { ok: true } | { ok: false; error: string };

/**
 * 독서 세션 기록 — 얇은 어댑터(인가 게이트 → 유스케이스).
 * 분·페이지 불변식은 도메인(ReadingSession.log)이 강제하고, 위반은 한국어 메시지로 변환한다.
 */
export async function logReadingSession(
  input: LogReadingSessionInput,
): Promise<LogReadingSessionResult> {
  try {
    const userId = await (await createAuthSession()).getCurrentUserId();
    if (!userId) return { ok: false, error: '로그인이 필요해요.' };

    const useCase = await createLogReadingSessionUseCase();
    await useCase.execute({
      userId,
      bookId: input.bookId,
      minutes: input.minutes,
      startPage: input.startPage ?? null,
      endPage: input.endPage ?? null,
    });
    // 독서 기록·통계·홈에 누적 반영.
    revalidatePath(ROUTES.READING());
    revalidatePath(ROUTES.STATS());
    revalidatePath(ROUTES.DASHBOARD());
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toUserError(error) };
  }
}

/** 도메인 예외 → 사용자가 무엇을 고쳐야 하는지 알 수 있는 한국어 메시지. */
function toUserError(error: unknown): string {
  if (error instanceof InvalidSessionMinutesError) return '읽은 시간을 확인해 주세요.';
  if (error instanceof InvalidPageRangeError) return '페이지 범위를 확인해 주세요.';
  if (error instanceof DomainError) return '세션 정보를 확인해 주세요.';
  return '기록에 실패했어요.';
}

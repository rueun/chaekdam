import { logError } from '@/lib/logger';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createAuthSession,
  createContinueDiscussionUseCase,
} from '@/lib/infrastructure/di-container';
import {
  BookNotFoundError,
  DiscussionAccessDeniedError,
  DiscussionNotFoundError,
} from '@/lib/domain/shared/errors';

/**
 * 토론 이어가기(AI 응답 스트리밍) Route Handler — ADR-017.
 * Server Action 은 토큰 단위 점진 응답을 표현하지 못해, 스트리밍 응답에 한해 Route Handler 를 둔다.
 * 얇은 어댑터: 인증 게이트 → 입력 검증 → 유스케이스 제너레이터 → text/plain 스트림.
 * 비즈니스/저장 로직은 ContinueDiscussionUseCase.executeStreaming 이 담당한다.
 */
const bodySchema = z.object({ content: z.string().trim().min(1).max(2000) });

/** 도메인 오류 → HTTP 상태(스트림 시작 전 초기 오류 한정). */
function errorStatus(error: unknown): number {
  // 타인 방(AccessDenied)도 404 로 응답해 리소스 존재 여부를 노출하지 않는다.
  if (
    error instanceof DiscussionNotFoundError ||
    error instanceof DiscussionAccessDeniedError ||
    error instanceof BookNotFoundError
  ) {
    return 404;
  }
  return 502; // AI 호출 실패·빈 응답 등 상류 오류
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '메시지를 입력해 주세요.' }, { status: 400 });
  }

  const useCase = await createContinueDiscussionUseCase();
  const generator = useCase.executeStreaming({
    discussionId: id,
    userId,
    content: parsed.data.content,
  });

  // 첫 델타를 먼저 당겨 초기 오류(없는 방·AI 실패)를 200 응답 이전에 잡는다.
  let first: IteratorResult<string>;
  try {
    first = await generator.next();
  } catch (error) {
    logError('Discussion stream failed to start', error);
    return NextResponse.json(
      { error: 'AI 응답에 실패했어요. 잠시 후 다시 시도해 주세요.' },
      { status: errorStatus(error) },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
        for await (const delta of generator) {
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (error) {
        // 스트림 도중 실패 — 유스케이스가 저장하지 않으므로 부분 응답은 버려진다(클라가 롤백).
        logError('Discussion stream failed mid-way', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      // 프록시 버퍼링 비활성화(델타가 즉시 전달되도록)
      'X-Accel-Buffering': 'no',
    },
  });
}

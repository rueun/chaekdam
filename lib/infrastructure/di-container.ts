import 'server-only';
import { CaptureHighlightUseCase } from '@/lib/application/capture-highlight.use-case';
import type { AuthSession } from '@/lib/domain/ports/auth-session';
import { createSupabaseServerClient } from './supabase/server-client';
import { SupabaseHighlightRepository } from './supabase/supabase-highlight-repository';
import { SupabaseAuthSession } from './supabase/supabase-auth-session';

/**
 * 의존성 조립 — 유스케이스/포트에 Infra Adapter 를 주입하는 유일한 지점.
 * 요청 범위 Supabase 클라이언트(사용자 세션·RLS)를 어댑터에 연결한다.
 */
export async function createCaptureHighlightUseCase(): Promise<CaptureHighlightUseCase> {
  const client = await createSupabaseServerClient();
  return new CaptureHighlightUseCase(new SupabaseHighlightRepository(client));
}

/** 현재 요청의 인증 컨텍스트(진입점 인가 게이트용). */
export async function createAuthSession(): Promise<AuthSession> {
  const client = await createSupabaseServerClient();
  return new SupabaseAuthSession(client);
}

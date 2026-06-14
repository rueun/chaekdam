import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/infrastructure/supabase/server-client';
import { siteUrl } from '@/lib/app-url';
import { ROUTES } from '@/lib/router/routes';

/**
 * OAuth 콜백 — Supabase 가 Google 인증 후 code(또는 error)와 함께 돌려보낸다.
 * code 를 세션으로 교환(쿠키 설정)한 뒤 대시보드로 이동. 실패 시 로그인으로.
 * 목적지 origin 은 설정값(siteUrl)으로 고정한다(요청 헤더 신뢰 회피).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');

  // 팝업/탭 공통 마무리 페이지로 보낸다(팝업이면 닫고 부모에 알림, 아니면 목적지로 이동).
  const done = (ok: boolean) =>
    NextResponse.redirect(`${siteUrl()}${ROUTES.AUTH.POPUP_COMPLETE()}${ok ? '' : '?error=oauth'}`);

  if (oauthError) {
    // 사용자가 동의를 거부한 경우 등 — 사유는 로그로만(사용자에겐 일반 메시지).
    console.error('OAuth callback: provider returned error', oauthError);
    return done(false);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return done(true);
    console.error('OAuth callback: failed to exchange code', {
      status: error.status,
      message: error.message,
    });
  }

  return done(false);
}

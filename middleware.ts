import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/infrastructure/supabase/middleware-client';
import { ROUTES } from '@/lib/router/routes';

// 비로그인 접근 허용 경로(인증 화면 + OAuth 콜백 + 랜딩 + 개발용 ui-kit)
const PUBLIC_PATHS = new Set<string>([
  ROUTES.AUTH.LOGIN(),
  ROUTES.AUTH.SIGNUP(),
  ROUTES.AUTH.CALLBACK(),
  ROUTES.AUTH.POPUP_COMPLETE(),
  '/ui-kit',
]);

/**
 * 모든 요청에서 Supabase 세션을 갱신하고 접근을 통제한다.
 * - 비로그인 + 보호 경로 → 로그인으로
 * - 로그인 + 인증 화면/랜딩 → 홈으로
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN();
    url.search = ''; // 원본 쿼리스트링이 로그인 URL 로 새지 않도록
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname === ROUTES.AUTH.LOGIN() ||
      pathname === ROUTES.AUTH.SIGNUP() ||
      pathname === ROUTES.HOME())
  ) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD();
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // 정적 자원·이미지를 제외한 모든 경로에서 실행
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

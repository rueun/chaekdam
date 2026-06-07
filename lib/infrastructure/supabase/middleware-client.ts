import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseEnv } from './env';

/**
 * 미들웨어에서 Supabase 세션을 갱신한다(@supabase/ssr 표준 패턴).
 * 요청/응답 쿠키를 동기화해 토큰을 자동 리프레시하고, 현재 사용자를 함께 돌려준다.
 * 라우트 보호 판단은 호출하는 middleware.ts 가 담당한다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() 는 토큰을 서버에서 검증한다(getSession 보다 안전).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

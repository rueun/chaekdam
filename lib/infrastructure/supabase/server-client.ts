import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types.gen';
import { supabaseEnv } from './env';

/**
 * 요청 범위 Supabase 서버 클라이언트 — 사용자 세션(쿠키) 을 그대로 싣는다.
 * 쿼리가 로그인 사용자 권한으로 실행돼 RLS 가 본인 데이터만 허용한다.
 * Server Action / Route Handler 에서 사용. (Infra 계층이라 Next 의존 허용)
 * 반환 타입은 @supabase/ssr 의 추론에 맡긴다(supabase-js 와 제네릭 아리티 차이 회피).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component 렌더 중 호출되면 쓰기가 불가하다 — 미들웨어가 세션을 갱신하므로 무시.
        }
      },
    },
  });
}

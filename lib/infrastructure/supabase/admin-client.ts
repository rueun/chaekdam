import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';
import { supabaseEnv, supabaseServiceRoleKey } from './env';

/**
 * service_role(secret) 키 클라이언트 — RLS 를 우회한다. 서버 전용·관리 작업·테스트용.
 * 절대 클라이언트 번들/브라우저에 노출하지 않는다.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const { url } = supabaseEnv();
  return createClient<Database>(url, supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

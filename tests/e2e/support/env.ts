import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * .env.local 을 process.env 로 로드한다(없으면 조용히 통과).
 * Next dev 서버는 자동 로드하지만, Playwright 테스트 프로세스(Node)는 아니므로 여기서 채운다.
 * CI 에서는 워크플로가 env 를 직접 주입하므로 파일이 없어도 된다.
 */
export function loadEnvLocal(): void {
  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (/^".*"$|^'.*'$/.test(value)) value = value.slice(1, -1);
    else value = value.split(/\s+#/)[0]!.trim();
    process.env[key] ??= value; // 기존 환경 변수(CI) 우선
  }
}

/** E2E 가 필요로 하는 Supabase 접속 정보(로컬 데모 키). 누락 시 명확히 실패. */
export function supabaseE2eEnv(): { url: string; anonKey: string; serviceRoleKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase env for E2E: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  return { url, anonKey, serviceRoleKey };
}

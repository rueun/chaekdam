import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// .env.local 을 process.env 로 로드(Next.js 는 자동 로드하지만 Vitest 는 아님).
// 통합 테스트(Supabase) 가 NEXT_PUBLIC_SUPABASE_URL 등을 읽을 수 있게 한다.
function loadEnvLocal(): void {
  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  } catch {
    return; // 파일이 없으면 조용히 통과(단위 테스트는 env 불필요)
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // 따옴표로 감싼 값은 따옴표 제거, 따옴표 없는 값은 인라인 주석(# ...) 제거
    if (/^".*"$|^'.*'$/.test(value)) value = value.slice(1, -1);
    else value = value.split(/\s+#/)[0]!.trim();
    process.env[key] ??= value; // 기존 환경 변수 우선
  }
}

loadEnvLocal();

import 'server-only';

/** Claude(Anthropic) API 키 — 서버 전용. 누락 시 명확히 실패시킨다(호출 시점). */
export function anthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY');
  return key;
}

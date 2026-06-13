/**
 * 독서일(reading day) 경계 — 단일 로케일 제품이므로 "하루"는 한국 표준시(KST) 캘린더
 * 날짜로 정의한다(연속일·오늘 읽은 분 집계의 기준). KST 는 DST 가 없어 +9 고정.
 *
 * 날짜 키는 'YYYY-MM-DD'(KST 기준) 문자열로 표준화한다.
 */
const READING_DAY_TIME_ZONE = 'Asia/Seoul';

const dayPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: READING_DAY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * 시각(UTC instant)을 KST 캘린더 날짜 키 'YYYY-MM-DD' 로 변환한다.
 * 로케일 출력 형식(구분자·순서)에 의존하지 않도록 formatToParts 로 필드를 직접 조립한다.
 */
export function toReadingDayKey(date: Date): string {
  const parts = dayPartsFormatter.formatToParts(date);
  const find = (type: 'year' | 'month' | 'day') => parts.find((p) => p.type === type)?.value ?? '';
  return readingDayKeyOf(Number(find('year')), Number(find('month')), Number(find('day')));
}

/** (연, 1~12월, 일)을 날짜 키 'YYYY-MM-DD' 로 만든다. */
export function readingDayKeyOf(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * 'YYYY-MM-DD' 의 하루 전 키.
 * KST 는 DST 가 없으므로 키를 순수 캘린더 날짜로 보고 UTC 기준 감산해도 안전하다.
 */
export function previousReadingDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  const prev = new Date(Date.UTC(year, month - 1, day) - 86_400_000);
  return readingDayKeyOf(prev.getUTCFullYear(), prev.getUTCMonth() + 1, prev.getUTCDate());
}

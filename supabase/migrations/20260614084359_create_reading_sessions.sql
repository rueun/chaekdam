-- 독서 세션(ReadingSession) — 한 번의 읽기(분 + 선택적 페이지 범위).
-- 도메인 lib/domain/reading-log/reading-session.ts 와 매핑. 일자별 통계·연속일(ReadingLog)은
-- 별도 테이블 없이 이 세션들에서 파생(투영)한다. 컬럼은 snake_case, Adapter 가 camelCase 변환.

create table reading_sessions (
  id uuid primary key default gen_random_uuid(),
  -- 소유자 — 로그인 사용자가 자동 설정(RLS 와 함께 본인 기록만 보장)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 어떤 책을 읽었는지(책 삭제 시 세션도 함께 정리)
  book_id uuid not null references books (id) on delete cascade,
  -- 읽은 시간(분) — 도메인 불변식과 이중 방어: 정수 1~1440(하루)
  minutes integer not null check (minutes between 1 and 1440),
  start_page integer,
  end_page integer,
  -- 세션 발생 시각(통계·연속일 집계 기준). created_at 과 구분(과거 기록 보정 대비).
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  -- 페이지 범위 불변식(도메인과 이중 방어): 둘 다 없거나, 둘 다 있고 0 ≤ start ≤ end
  constraint reading_sessions_page_pair check ((start_page is null) = (end_page is null)),
  constraint reading_sessions_page_range
    check (start_page is null or (start_page >= 0 and end_page >= start_page))
);

-- 사용자별 최근순 조회(findAll)용 인덱스
create index reading_sessions_user_id_occurred_at_idx
  on reading_sessions (user_id, occurred_at desc);

-- ─── RLS — 본인 기록만 접근(ADR-004: RLS + 도메인 이중 방어) ───
alter table reading_sessions enable row level security;

create policy "본인 독서 세션 조회" on reading_sessions
  for select using (auth.uid() = user_id);

create policy "본인 독서 세션 기록" on reading_sessions
  for insert with check (auth.uid() = user_id);

create policy "본인 독서 세션 수정" on reading_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "본인 독서 세션 삭제" on reading_sessions
  for delete using (auth.uid() = user_id);

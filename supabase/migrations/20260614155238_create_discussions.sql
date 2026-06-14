-- AI 독서토론 — 토론 방(discussions) + 발화(messages).
-- 도메인 lib/domain/discussion/* 와 매핑. 컬럼은 snake_case, Adapter 가 camelCase 변환.
-- 설계: docs/specs/2026-06-14-ai-discussion-design.md (ADR-005·007·015)

create table discussions (
  id uuid primary key default gen_random_uuid(),
  -- 소유자 — 로그인 사용자가 자동 설정(RLS 와 함께 본인 토론만 보장)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 어떤 책에 대한 토론인지(책 삭제 시 토론도 함께 정리)
  book_id uuid not null references books (id) on delete cascade,
  -- 페르소나(생성 후 불변). DB 엔 4종 허용(미래 대비), 작가 본인 거부는 도메인이 강제.
  persona_key text not null check (persona_key in ('socrates', 'critic', 'author', 'friend')),
  -- 첫 턴을 여는 시드 한 줄(선택). 한 줄 삭제돼도 방은 유지(set null).
  seed_highlight_id uuid references highlights (id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  -- 소유자 비정규화 — 기존 테이블과 동일한 단순 RLS(auth.uid() = user_id)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  discussion_id uuid not null references discussions (id) on delete cascade,
  role text not null check (role in ('USER', 'AI')),
  content text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);

-- 목록(사용자별 최신순)·방별 메시지(시간순) 조회 인덱스
create index discussions_user_id_created_at_idx on discussions (user_id, created_at desc);
create index messages_discussion_id_created_at_idx on messages (discussion_id, created_at);

-- ─── RLS — 본인 데이터만 접근(ADR-004: RLS + 도메인 이중 방어) ───
alter table discussions enable row level security;

create policy "본인 토론 조회" on discussions
  for select using (auth.uid() = user_id);
create policy "본인 토론 생성" on discussions
  for insert with check (auth.uid() = user_id);
create policy "본인 토론 수정" on discussions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "본인 토론 삭제" on discussions
  for delete using (auth.uid() = user_id);

alter table messages enable row level security;

create policy "본인 발화 조회" on messages
  for select using (auth.uid() = user_id);
-- 작성은 본인 + 본인 소유 토론에 한정 — 타인 방 id 를 알아도 그 방에 발화 삽입 불가.
create policy "본인 발화 작성" on messages
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from discussions d where d.id = discussion_id and d.user_id = auth.uid())
  );
-- 메시지는 도메인상 불변(생성 후 수정/삭제 없음) — update/delete 정책을 두지 않는다.
-- 방 삭제 시 발화 정리는 discussions ON DELETE CASCADE 가 담당한다.

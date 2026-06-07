-- 책 — 책장(shelf)에 담긴 책 메타 + 상태. 도메인 lib/domain/book/book.ts 와 매핑.
-- 컬럼은 snake_case, Adapter 가 도메인 camelCase 로 변환한다.

-- 책장 상태(도메인 BookStatus VO 와 일치). 위시리스트 = WISH.
create type book_status as enum ('READING', 'DONE', 'WISH', 'PAUSED');

create table books (
  id uuid primary key default gen_random_uuid(),
  -- 소유자 — 로그인 사용자가 자동 설정(RLS 와 함께 본인 책장만 보장)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  author text not null default '',
  status book_status not null default 'WISH',
  -- 표지 색(디자인 토큰 CSS color)
  cover_color text,
  created_at timestamptz not null default now()
);

-- 책장 상태별 조회용 인덱스
create index books_user_id_status_idx on books (user_id, status);

-- ─── RLS — 본인 책장만 접근(ADR-004) ───
alter table books enable row level security;

create policy "본인 책 조회" on books
  for select using (auth.uid() = user_id);

create policy "본인 책 담기" on books
  for insert with check (auth.uid() = user_id);

create policy "본인 책 수정" on books
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "본인 책 삭제" on books
  for delete using (auth.uid() = user_id);

-- TODO(books): highlights.book_id → books.id FK 는 다음 증분(배선)에서 별도 마이그레이션으로 추가.
-- 기존 highlights 의 샘플 uuid 정리(또는 db reset) 후 적용 예정.

-- 한 줄(Highlight) — 캡처한 인상 깊은 구절. 도메인 엔티티 lib/domain/highlight/highlight.ts 와 매핑.
-- 컬럼은 snake_case(Postgres 관습), Adapter 가 도메인 camelCase 로 변환한다.

-- 출처: 사진 추출(PHOTO) / 직접 입력(TEXT) — 도메인 NoteSource VO 와 일치
create type note_source as enum ('PHOTO', 'TEXT');

create table highlights (
  id uuid primary key default gen_random_uuid(),
  -- 소유자 — 로그인 사용자가 자동 설정(RLS 와 함께 본인 데이터만 보장)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 책 식별자(외부 책 메타 캐시 books.id 참조 예정 — books 테이블 도입 시 FK 추가)
  book_id uuid not null,
  source note_source not null,
  content text not null check (char_length(content) between 1 and 5000),
  photo_url text,
  page text,
  created_at timestamptz not null default now(),
  -- 사진 출처는 사진 URL 필수(도메인 불변식과 이중 방어)
  constraint photo_requires_url check (source <> 'PHOTO' or photo_url is not null)
);

-- 책별 최신순 조회(findByBookId)용 인덱스
create index highlights_book_id_created_at_idx on highlights (book_id, created_at desc);
create index highlights_user_id_idx on highlights (user_id);

-- ─── RLS — 본인 데이터만 접근(ADR-004: RLS + 도메인 Specification 이중 방어) ───
alter table highlights enable row level security;

create policy "본인 한 줄 조회" on highlights
  for select using (auth.uid() = user_id);

create policy "본인 한 줄 작성" on highlights
  for insert with check (auth.uid() = user_id);

create policy "본인 한 줄 수정" on highlights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "본인 한 줄 삭제" on highlights
  for delete using (auth.uid() = user_id);

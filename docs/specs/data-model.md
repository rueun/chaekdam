# Data Model — Supabase 스키마 + RLS

> [`domain-model.md`](./domain-model.md) 의 도메인 엔티티를 Supabase Postgres 스키마로 매핑.
> 모든 테이블에 **RLS(Row Level Security) 활성화** + 도메인 Specification 과 이중 방어 (ADR-004).

---

## 1. 테이블 매핑

| 도메인 엔티티     | 테이블             | 비고                                           |
| ----------------- | ------------------ | ---------------------------------------------- |
| `User`            | `users`            | Supabase Auth 의 `auth.users` 와 1:1 (FK 연결) |
| `Author`          | `authors`          | 공유 데이터                                    |
| `Book`            | `books`            | 공유 데이터, 외부 API 캐시                     |
| `Persona`         | `personas`         | 시스템 큐레이션 데이터                         |
| `ReadingNote`     | `reading_notes`    | 사용자 소유                                    |
| `Discussion`      | `discussions`      | Aggregate Root                                 |
| `Discussion-Note` | `discussion_notes` | discussions ↔ reading_notes 다대다 조인 테이블 |
| `Participant`     | `participants`     | Discussion 의 자식                             |
| `Message`         | `messages`         | Discussion 의 자식                             |
| `Reflection`      | `reflections`      | Discussion 종료 후 작성                        |

---

## 2. SQL 스키마

```sql
-- ============================================
-- 0. 공통 — UUID v7 함수 (PostgreSQL 17+ 또는 확장)
-- ============================================
-- 책담은 UUID v7 사용 (시간 정렬 가능). pg17+ 권장 또는 별도 확장 / 앱에서 생성.

-- ============================================
-- 1. users — Supabase Auth 와 1:1
-- ============================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nickname text not null check (char_length(nickname) between 1 and 30),
  created_at timestamptz not null default now()
);

-- ============================================
-- 2. authors
-- ============================================
create table authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) > 0),
  birth_year int,
  death_year int,
  nationality text,
  created_at timestamptz not null default now(),
  check (death_year is null or birth_year is null or death_year > birth_year)
);

-- ============================================
-- 3. books
-- ============================================
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_id uuid not null references authors(id) on delete restrict,
  genre text not null,
  summary text not null check (char_length(summary) <= 200),
  author_style text,
  cover_image_url text,
  external_source text not null check (external_source in ('NAVER', 'GOOGLE_BOOKS', 'MANUAL')),
  external_id text,
  created_at timestamptz not null default now()
);

create unique index books_external_unique
  on books(external_source, external_id)
  where external_id is not null;

-- ============================================
-- 4. personas — 시스템 큐레이션
-- ============================================
create table personas (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'STUDIOUS', 'CASUAL', 'CRITIC', 'POETIC', 'PHILOSOPHICAL'
  )),
  display_name text not null,
  description text not null,
  system_prompt text not null check (char_length(system_prompt) > 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 기본 페르소나는 정확히 1개
create unique index personas_default_unique
  on personas((true)) where is_default = true;

-- ============================================
-- 5. reading_notes
-- ============================================
create table reading_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  book_id uuid not null references books(id) on delete restrict,
  source text not null check (source in ('PHOTO', 'TEXT')),
  content text not null check (char_length(content) between 1 and 5000),
  photo_url text,
  created_at timestamptz not null default now(),
  check (
    (source = 'PHOTO' and photo_url is not null)
    or (source = 'TEXT' and photo_url is null)
  )
);

create index reading_notes_user_idx on reading_notes(user_id, created_at desc);

-- ============================================
-- 6. discussions
-- ============================================
create table discussions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete restrict,
  persona_id uuid not null references personas(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'ABANDONED')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (status = 'ACTIVE' or ended_at is not null)
);

create index discussions_started_idx on discussions(started_at desc);

-- ============================================
-- 7. discussion_notes — discussions ↔ reading_notes 다대다
-- ============================================
create table discussion_notes (
  discussion_id uuid not null references discussions(id) on delete cascade,
  reading_note_id uuid not null references reading_notes(id) on delete restrict,
  primary key (discussion_id, reading_note_id)
);

-- ============================================
-- 8. participants — Discussion 의 참가자 (USER 또는 AI)
-- ============================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references discussions(id) on delete cascade,
  role text not null check (role in ('USER', 'AI')),
  user_id uuid references users(id) on delete cascade,
  persona_id uuid references personas(id) on delete restrict,
  joined_at timestamptz not null default now(),
  check (
    (role = 'USER' and user_id is not null and persona_id is null)
    or (role = 'AI' and persona_id is not null and user_id is null)
  )
);

create index participants_discussion_idx on participants(discussion_id);
create index participants_user_idx on participants(user_id) where user_id is not null;

-- 같은 Discussion 안에 동일 (role, user_id) 또는 (role, persona_id) 중복 X
create unique index participants_user_unique
  on participants(discussion_id, user_id) where role = 'USER';
create unique index participants_persona_unique
  on participants(discussion_id, persona_id) where role = 'AI';

-- ============================================
-- 9. messages
-- ============================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references discussions(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete restrict,
  role text not null check (role in ('USER', 'AI')),
  content text not null check (char_length(content) between 1 and 10000),
  sent_at timestamptz not null default now()
);

create index messages_discussion_idx on messages(discussion_id, sent_at);

-- ============================================
-- 10. reflections
-- ============================================
create table reflections (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references discussions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 10000),
  mood text check (mood in ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
  tags text[] check (array_length(tags, 1) is null or array_length(tags, 1) <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discussion_id, user_id)  -- 한 토론당 본인 회고는 1개
);

create index reflections_user_idx on reflections(user_id, created_at desc);
```

---

## 3. RLS 정책

모든 테이블에 RLS 활성화. **이중 방어** (ADR-004): RLS + 도메인 Specification.

```sql
-- ============================================
-- users — 본인만 SELECT, INSERT (가입), UPDATE
-- ============================================
alter table users enable row level security;

create policy "users select own"
  on users for select using (auth.uid() = id);

create policy "users insert self"
  on users for insert with check (auth.uid() = id);

create policy "users update own"
  on users for update using (auth.uid() = id);

-- ============================================
-- authors / books / personas — 공유 데이터, 모두 SELECT 가능
-- INSERT / UPDATE 는 서비스 역할만 (관리자 또는 시스템 작업)
-- ============================================
alter table authors enable row level security;
alter table books enable row level security;
alter table personas enable row level security;

create policy "authors select all"  on authors  for select using (true);
create policy "books select all"    on books    for select using (true);
create policy "personas select all" on personas for select using (true);

-- INSERT / UPDATE 는 service_role 만 (RLS bypass)

-- ============================================
-- reading_notes — 본인 소유만
-- ============================================
alter table reading_notes enable row level security;

create policy "notes select own"
  on reading_notes for select using (auth.uid() = user_id);

create policy "notes insert own"
  on reading_notes for insert with check (auth.uid() = user_id);

create policy "notes update own"
  on reading_notes for update using (auth.uid() = user_id);

create policy "notes delete own"
  on reading_notes for delete using (auth.uid() = user_id);

-- ============================================
-- discussions — 참가자만 (participants 조인)
-- ============================================
alter table discussions enable row level security;

create policy "discussions select participant"
  on discussions for select using (
    exists (
      select 1 from participants p
      where p.discussion_id = discussions.id
        and p.user_id = auth.uid()
    )
  );

create policy "discussions insert by participant"
  on discussions for insert with check (true);
  -- 실제 검증: Server Action 에서 participants 동시 생성

create policy "discussions update participant"
  on discussions for update using (
    exists (
      select 1 from participants p
      where p.discussion_id = discussions.id
        and p.user_id = auth.uid()
    )
  );

-- ============================================
-- participants — 본인이 속한 토론의 참가자만 조회
-- ============================================
alter table participants enable row level security;

create policy "participants select own discussion"
  on participants for select using (
    discussion_id in (
      select p.discussion_id from participants p where p.user_id = auth.uid()
    )
  );

create policy "participants insert own"
  on participants for insert with check (
    (role = 'USER' and user_id = auth.uid())
    or (role = 'AI')  -- AI participant 는 사용자가 만든 discussion 에서만 생성 (Server Action 검증)
  );

-- ============================================
-- discussion_notes — 본인 토론의 노트 매핑만
-- ============================================
alter table discussion_notes enable row level security;

create policy "discussion_notes select own"
  on discussion_notes for select using (
    discussion_id in (
      select p.discussion_id from participants p where p.user_id = auth.uid()
    )
  );

create policy "discussion_notes insert own"
  on discussion_notes for insert with check (
    discussion_id in (
      select p.discussion_id from participants p where p.user_id = auth.uid()
    )
    and reading_note_id in (
      select id from reading_notes where user_id = auth.uid()
    )
  );

-- ============================================
-- messages — 토론 참가자만
-- ============================================
alter table messages enable row level security;

create policy "messages select participant"
  on messages for select using (
    discussion_id in (
      select p.discussion_id from participants p where p.user_id = auth.uid()
    )
  );

create policy "messages insert participant"
  on messages for insert with check (
    discussion_id in (
      select p.discussion_id from participants p where p.user_id = auth.uid()
    )
  );

-- ============================================
-- reflections — 본인 회고만
-- ============================================
alter table reflections enable row level security;

create policy "reflections select own"
  on reflections for select using (auth.uid() = user_id);

create policy "reflections insert own"
  on reflections for insert with check (
    auth.uid() = user_id
    -- Discussion 이 COMPLETED 상태인지 검증은 Application 계층에서
  );

create policy "reflections update own"
  on reflections for update using (auth.uid() = user_id);

create policy "reflections delete own"
  on reflections for delete using (auth.uid() = user_id);
```

---

## 4. Storage 정책 (사진 업로드)

Supabase Storage 의 `reading-note-photos` 버킷:

```sql
-- 본인 폴더에만 업로드 가능 (path: <user_id>/<filename>)
create policy "photos upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'reading-note-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos read own"
  on storage.objects for select
  using (
    bucket_id = 'reading-note-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos delete own"
  on storage.objects for delete
  using (
    bucket_id = 'reading-note-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 5. 트리거 / 제약 / 자동화

```sql
-- updated_at 자동 갱신 (reflections)
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reflections_updated_at
  before update on reflections
  for each row execute function set_updated_at();

-- discussions 의 status 변경 시 ended_at 자동 설정
create or replace function set_discussion_ended_at() returns trigger as $$
begin
  if new.status in ('COMPLETED', 'ABANDONED') and new.ended_at is null then
    new.ended_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger discussions_ended_at
  before update on discussions
  for each row execute function set_discussion_ended_at();
```

---

## 6. 마이그레이션 순서

`supabase/migrations/` 에 다음 순서로 분리:

1. `0001_users.sql` — users
2. `0002_books_authors.sql` — authors + books
3. `0003_personas.sql` — personas + 시드 데이터(기본 페르소나)
4. `0004_reading_notes.sql` — reading_notes + 사진 storage 버킷
5. `0005_discussions.sql` — discussions + participants + discussion_notes
6. `0006_messages.sql` — messages
7. `0007_reflections.sql` — reflections
8. `0008_rls.sql` — 모든 RLS 정책
9. `0009_triggers.sql` — updated_at, ended_at 트리거

---

## 7. 시드 데이터 (`seed.sql`)

```sql
-- 기본 페르소나 3개
insert into personas (category, display_name, description, system_prompt, is_default) values
  (
    'STUDIOUS',
    '학구파 독서 친구',
    '진지하게 의미와 상징을 함께 사색해요',
    '당신은 책을 사랑하는 학구파 독서 친구입니다. 사용자가 책에서 인상 깊은 구절을 가져오면 함께 그 의미·상징·시대 배경을 진지하게 탐구합니다. 따뜻한 톤을 유지하되 깊이 있는 질문을 던집니다.',
    true
  ),
  (
    'CASUAL',
    '캐주얼한 친구',
    '편하게 감상을 나누는 친구',
    '당신은 책을 좋아하는 캐주얼한 친구입니다. 사용자의 인상 깊은 구절에 대해 편안한 말투로 공감하고 가볍게 대화를 이어갑니다. 너무 무거워지지 않게.',
    false
  ),
  (
    'CRITIC',
    '비평가',
    '다른 시각으로 다시 보는 비평가',
    '당신은 날카로운 시각을 가진 책 비평가입니다. 사용자의 감상에 무조건 동의하지 않고 다른 해석·반론·맥락을 제시해 토론을 활성화합니다. 무례하지 않게.',
    false
  );
```

---

## 8. Supabase 타입 자동 생성

```bash
supabase gen types typescript --local > lib/infrastructure/supabase/types.gen.ts
```

→ `Database` 타입 자동 생성. 도메인 모델은 이 타입에 의존하지 않고 (ADR-003), Adapter 에서만 매핑.

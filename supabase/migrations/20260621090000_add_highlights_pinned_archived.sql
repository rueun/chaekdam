-- 한 줄 고정(pin)·보관(archive) 상태(ADR-021).
-- pinned: 목록 상단 고정 표시. archived: 기본 목록에서 숨기고 '보관함' 에서만 표시.
alter table highlights
  add column pinned boolean not null default false,
  add column archived boolean not null default false;

-- 기본 목록: 보관 제외 + 고정 우선, 그 안에서 최신순. 보관함: archived = true.
create index highlights_user_active_idx
  on highlights (user_id, archived, pinned desc, created_at desc);

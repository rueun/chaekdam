-- 한 줄 태그(ADR-023) — 자유 입력 태그. 한 줄을 주제로 묶고 /highlights 에서 필터한다.
alter table highlights
  add column tags text[] not null default '{}';

-- 태그 필터(tags @> ARRAY['...']) 가속.
create index highlights_tags_idx on highlights using gin (tags);

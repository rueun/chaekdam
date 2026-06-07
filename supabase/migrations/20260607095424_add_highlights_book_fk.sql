-- highlights.book_id → books.id 외래키. books 테이블 도입 후 무결성 강화.
-- on delete cascade: 책 삭제 시 그 책의 한 줄도 함께 정리.
--   현재 책 삭제 경로는 위시(WISH) 제거뿐이라 한 줄이 없어 안전. 읽은 책 삭제 UI 도입 시
--   앱 단에서 한 줄 보존/이관 정책을 재검토할 것.

-- books 도입 전 캡처(샘플 uuid)로 생긴 orphan highlight 정리 — FK 추가 전 선행.
delete from highlights h
where not exists (select 1 from books b where b.id = h.book_id);

-- 멱등성: db reset/재적용 시 제약 중복 추가를 피한다.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'highlights_book_id_fkey') then
    alter table highlights
      add constraint highlights_book_id_fkey
      foreign key (book_id) references books (id) on delete cascade;
  end if;
end $$;

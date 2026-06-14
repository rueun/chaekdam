-- 책 표지 이미지 URL(도서 API 썸네일). 없으면 null → 표현 계층에서 색 스파인으로 폴백(ADR-016 갱신).
alter table books add column cover_image_url text;

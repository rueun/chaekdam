-- 한 줄 사진 원본 저장 버킷(ADR-020). 사진 출처(PHOTO) Highlight 의 photo_url 이 이 버킷 객체를 가리킨다.
-- public 버킷: 읽기는 공개 URL(추측 불가한 uuid 경로) — 기존 책 표지 공개 URL 과 동일한 정책.
-- 쓰기/수정/삭제는 본인 폴더(userId/...)로 제한해 타인 객체 변조를 막는다(ADR-004 이중 방어).
insert into storage.buckets (id, name, public)
values ('highlight-photos', 'highlight-photos', true)
on conflict (id) do nothing;

-- 공개 URL(GET)은 RLS 를 우회하지만, 인증 경로(list/관리 API)에서 타인 객체 메타데이터
-- 나열을 막기 위해 SELECT 도 본인 폴더로 제한한다(심층 방어).
create policy "본인 한 줄 사진만 조회"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'highlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 폴더에 한 줄 사진 업로드"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'highlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 한 줄 사진 수정"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'highlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 한 줄 사진 삭제"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'highlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

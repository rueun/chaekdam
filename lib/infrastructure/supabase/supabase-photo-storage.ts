import type { SupabaseClient } from '@supabase/supabase-js';
import type { PhotoStorage, PhotoUpload } from '@/lib/domain/ports/photo-storage';
import type { Database } from './types.gen';

const BUCKET = 'highlight-photos';

/** MIME → 파일 확장자(저장 경로용). 미지원이면 jpg. */
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * PhotoStorage 의 Supabase Storage 어댑터(ADR-020).
 * 객체는 `{userId}/{uuid}.{ext}` 경로에 저장하고 공개 URL 을 돌려준다.
 * 본인 폴더 쓰기는 Storage RLS 가 강제한다(주입된 클라이언트의 사용자 권한으로 실행).
 */
export class SupabasePhotoStorage implements PhotoStorage {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async store(image: PhotoUpload): Promise<string> {
    const {
      data: { user },
      error: authError,
    } = await this.client.auth.getUser();
    if (authError || !user) throw new Error('Cannot store photo without an authenticated user');

    // 클라이언트가 보낸 MIME 을 신뢰하지 않고 화이트리스트로 검증(확장자·contentType 불일치 차단).
    const ext = EXT_BY_TYPE[image.mediaType];
    if (!ext) throw new Error(`Unsupported image type: ${image.mediaType}`);

    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(image.base64, 'base64');

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: image.mediaType, upsert: false });
    if (error) throw new Error(`Failed to upload photo: ${error.message}`);

    return this.client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async remove(url: string): Promise<void> {
    // 공개 URL 에서 버킷 내부 경로(`{userId}/{uuid}.{ext}`)를 추출한다.
    const marker = `/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index < 0) return; // 이 버킷의 URL 이 아니면 무시
    const path = url.slice(index + marker.length);
    const { error } = await this.client.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(`Failed to remove photo: ${error.message}`);
  }
}

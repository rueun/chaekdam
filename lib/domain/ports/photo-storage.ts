/** 저장할 사진(인프라가 base64 로 준비). */
export interface PhotoUpload {
  /** base64 데이터(data URL 접두사 제외) */
  base64: string;
  /** MIME 타입(예: 'image/jpeg') */
  mediaType: string;
}

/**
 * 사진 원본을 저장하는 Port(ADR-020) — 도메인이 정의하는 계약.
 * 구현(Adapter)은 Infrastructure 가 제공한다(SupabasePhotoStorage).
 * 도메인·유스케이스는 저장 기술(Supabase Storage 등)을 모른다(교체 가능).
 */
export interface PhotoStorage {
  /** 사진을 저장하고 접근 가능한 URL 을 반환한다. */
  store(image: PhotoUpload): Promise<string>;

  /** 저장된 사진을 삭제한다(저장 실패 보상 등). 없는 객체는 조용히 통과. */
  remove(url: string): Promise<void>;
}

/** 추출에 넘기는 이미지(인프라가 base64 로 준비). */
export interface PhotoQuoteImage {
  /** base64 데이터(data URL 접두사 제외) */
  base64: string;
  /** MIME 타입(예: 'image/jpeg') */
  mediaType: string;
}

/**
 * 책 사진에서 한 구절을 추출하는 Port(ADR-019) — 도메인이 정의하는 계약.
 * 구현(Adapter)은 Infrastructure 가 제공한다(ClaudeHighlightExtractor, Vision multimodal).
 * 도메인·유스케이스는 OCR/LLM 구현을 모른다(교체 가능).
 */
export interface HighlightExtractor {
  /** 이미지에서 인상적인 한 구절을 한국어 텍스트로 추출한다. 읽을 텍스트가 없으면 빈 문자열. */
  extractQuote(image: PhotoQuoteImage): Promise<string>;
}

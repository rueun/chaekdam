/**
 * 브라우저에서 이미지를 다운스케일해 JPEG data URL 로 변환한다.
 * Vision 전송 전 호출 — 페이로드/토큰 비용을 줄이고 서버 액션 본문 한도를 넘지 않게 한다.
 * (Claude 는 어차피 긴 변을 ~1568px 로 줄여 처리하므로 화질 손실이 거의 없다.)
 */
export async function downscaleImageToDataUrl(
  file: File,
  maxDimension = 1568,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';

/** 공유 카드에 필요한 한 줄 정보(표현용 plain). */
export interface ShareHighlight {
  content: string;
  author?: string;
  book?: string;
}

// 4:5 세로 카드(인스타그램 등에 적합). 논리 해상도 = 내보내기 해상도.
const W = 1080;
const H = 1350;
const PAD = 96;

/** 한 줄 이미지 공유 모달을 띄운다. */
export function openHighlightShare(highlight: ShareHighlight) {
  overlay.open(({ isOpen, unmount }) => (
    <HighlightShareModal isOpen={isOpen} onClose={unmount} highlight={highlight} />
  ));
}

/** CSS 변수(디자인 토큰)를 읽는다 — 캔버스 API 는 색 문자열이 필요하므로 토큰을 단일 소스로 가져온다. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** 글자 단위로 줄바꿈한다(한글은 공백 없이도 줄을 넘겨야 하므로 문자 기준). */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const char of paragraph) {
      const next = line + char;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** 본문이 카드 영역에 들어가도록 폰트 크기를 줄여가며 맞춘다. */
/** maxWidth 를 넘으면 끝을 말줄임(…)으로 자른다(한 줄용). */
function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
}

function fitQuote(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
): { size: number; lineHeight: number; lines: string[] } {
  for (let size = 60; size >= 30; size -= 4) {
    const lineHeight = Math.round(size * 1.5);
    ctx.font = `600 ${size}px Pretendard, sans-serif`;
    const lines = wrapLines(ctx, text, maxWidth);
    if (lines.length * lineHeight <= maxHeight) return { size, lineHeight, lines };
  }
  // 최소 크기에서도 넘치면 들어갈 줄 수만큼 자르고 마지막 줄을 말줄임 처리(출처·브랜드 영역 보호).
  const size = 30;
  const lineHeight = Math.round(size * 1.5);
  ctx.font = `600 ${size}px Pretendard, sans-serif`;
  const all = wrapLines(ctx, text, maxWidth);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  if (all.length <= maxLines) return { size, lineHeight, lines: all };
  const lines = all.slice(0, maxLines);
  lines[maxLines - 1] = ellipsize(ctx, `${lines[maxLines - 1]}…`, maxWidth);
  return { size, lineHeight, lines };
}

/** 한 줄을 브랜드 카드 이미지로 그린다. */
function draw(canvas: HTMLCanvasElement, highlight: ShareHighlight): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const paper = token('--paper-50', '#faf8f2');
  const ink = token('--ink-900', '#1a1a18');
  const inkSoft = token('--ink-600', '#5e5c53');
  const accent = token('--accent', '#3f6750');

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // 좌측 액센트 바
  ctx.fillStyle = accent;
  ctx.fillRect(PAD, PAD, 10, 120);

  // 큰 따옴표 글리프 — alpha 변경은 save/restore 로 격리(예외 시 상태 오염 방지)
  ctx.save();
  ctx.fillStyle = accent;
  ctx.font = '700 160px Pretendard, sans-serif';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.16;
  ctx.fillText('“', PAD + 36, PAD - 30);
  ctx.restore();

  // 본문(자동 맞춤)
  const textTop = PAD + 220;
  const textMaxWidth = W - PAD * 2;
  const textMaxHeight = H - textTop - 260;
  const { lineHeight, lines } = fitQuote(ctx, highlight.content, textMaxWidth, textMaxHeight);
  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => {
    ctx.fillText(line, PAD, textTop + (i + 1) * lineHeight - lineHeight * 0.3);
  });

  // 출처(저자 · 책) — 카드 폭을 넘으면 말줄임
  const source = [highlight.author, highlight.book].filter(Boolean).join(' · ');
  if (source) {
    ctx.fillStyle = inkSoft;
    ctx.font = '500 30px Pretendard, sans-serif';
    ctx.fillText(ellipsize(ctx, `— ${source}`, W - PAD * 2), PAD, H - 180);
  }

  // 브랜드 마크
  ctx.fillStyle = accent;
  ctx.font = '700 34px Pretendard, sans-serif';
  ctx.fillText('책담', PAD, H - 110);
  ctx.fillStyle = inkSoft;
  ctx.font = '500 26px Pretendard, sans-serif';
  ctx.fillText('AI 독서 토론', PAD + 86, H - 113);
}

/** canvas → PNG Blob */
function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function HighlightShareModal({
  isOpen,
  onClose,
  highlight,
}: {
  isOpen: boolean;
  onClose: () => void;
  highlight: ShareHighlight;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canShareFile, setCanShareFile] = useState(false);
  const [busy, setBusy] = useState(false);
  const { content, author, book } = highlight;

  // 폰트 로드 후 그려야 글자 폭 측정이 정확하다. 원시값 의존성으로 불필요한 재그리기 방지.
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    void document.fonts.ready.then(() => {
      if (active && canvasRef.current) draw(canvasRef.current, { content, author, book });
    });
    // 빈 파일은 일부 브라우저에서 canShare 신뢰도가 낮아 1바이트 더미로 감지.
    const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' });
    setCanShareFile(
      typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [probe] }),
    );
    return () => {
      active = false;
    };
  }, [isOpen, content, author, book]);

  const buildFile = async (): Promise<File | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const blob = await toBlob(canvas);
    return blob ? new File([blob], 'chaekdam-highlight.png', { type: 'image/png' }) : null;
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const file = await buildFile();
      if (!file) throw new Error('render failed');
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      // 일부 브라우저(Firefox)는 DOM 에 붙어 있어야 다운로드가 트리거된다.
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // 다운로드가 시작될 시간을 준 뒤 해제(즉시 revoke 시 취소될 수 있음).
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('이미지를 저장했어요');
    } catch {
      toast('이미지 저장에 실패했어요');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const file = await buildFile();
      if (!file) throw new Error('render failed');
      await navigator.share({ files: [file], title: '책담 — 오늘의 한 줄' });
    } catch (error) {
      // 사용자가 공유 시트를 닫은 경우(AbortError)는 조용히 무시.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        toast('공유에 실패했어요');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="이미지로 공유" align="center">
      <div className="flex flex-col items-center gap-4 p-1">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          role="img"
          className="border-divider shadow-2 w-full max-w-[300px] rounded-lg border"
          aria-label={`공유용 한 줄 카드: ${content.slice(0, 40)}${content.length > 40 ? '…' : ''}`}
        />
        <div className="flex w-full gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => void handleSave()}
            disabled={busy}
            aria-busy={busy}
          >
            <Icon name="download" size={16} />
            이미지 저장
          </Button>
          {canShareFile ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => void handleShare()}
              disabled={busy}
              aria-busy={busy}
            >
              <Icon name="share-2" size={16} />
              공유하기
            </Button>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}

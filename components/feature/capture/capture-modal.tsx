'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Icon, type IconName } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { captureHighlight, extractHighlightFromImage } from '@/app/(dashboard)/highlights/actions';
import { listMyBookOptions, type BookOption } from '@/app/(dashboard)/library/actions';
import { downscaleImageToDataUrl } from '@/lib/utils/downscale-image';

interface CaptureData {
  bookId: string;
  content: string;
  page: string | null;
}

/** 한 줄 담기 모달을 띄운다. */
export function openCapture() {
  overlay.open(({ isOpen, unmount }) => <CaptureModal isOpen={isOpen} onClose={unmount} />);
}

function CaptureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [books, setBooks] = useState<BookOption[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const requestSeqRef = useRef(0);
  useEffect(() => {
    // Strict Mode 마운트 재실행에서도 true 로 복구.
    mountedRef.current = true;
    return () => void (mountedRef.current = false);
  }, []);

  // 사용자 책장을 불러와 책 선택지로 사용
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const options = await listMyBookOptions();
        if (active) setBooks(options);
      } catch {
        if (active) toast('책장을 불러오지 못했어요');
      } finally {
        if (active) setBooksLoading(false); // 실패해도 스피너 고착 방지
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // objectURL 누수 방지
  useEffect(() => {
    if (!imageUrl) return;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const selectImage = (file?: File) => {
    if (!file) return;
    // 추출 요청 버전 — 추출 중 새 파일/취소 시 늦게 끝난 이전 응답이 최신 상태를 덮어쓰지 않게 한다.
    const seq = (requestSeqRef.current += 1);
    setImageUrl(URL.createObjectURL(file));
    setExtractedText('');
    setExtracting(true);
    // 이미지를 다운스케일해 Vision 추출(ADR-019). 실패해도 직접 입력으로 진행할 수 있게 한다.
    void (async () => {
      const current = () => mountedRef.current && requestSeqRef.current === seq;
      try {
        const dataUrl = await downscaleImageToDataUrl(file);
        const result = await extractHighlightFromImage(dataUrl);
        if (!current()) return;
        if (result.ok) setExtractedText(result.text);
        else toast(result.error);
      } catch {
        if (current()) toast('이미지를 처리하지 못했어요. 직접 입력해 주세요.');
      } finally {
        if (current()) setExtracting(false);
      }
    })();
  };

  const resetImage = () => {
    requestSeqRef.current += 1; // 진행 중 추출 결과 무효화
    setImageUrl(null);
    setExtractedText('');
    setExtracting(false);
  };

  // 검토한 텍스트를 Highlight 로 저장(Server Action → 유스케이스). 사진 업로드는 후속.
  const saveHighlight = (data: CaptureData) => {
    void (async () => {
      setPending(true);
      const result = await captureHighlight(data);
      if (!mountedRef.current) return; // 저장 중 모달이 닫혔으면 setState 생략
      setPending(false);
      if (result.ok) {
        onClose();
        toast('한 줄을 담았어요');
      } else {
        toast(result.error);
      }
    })();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="한 줄 담기"
      title={
        imageUrl ? (extracting ? '구절을 읽는 중' : '문장 확인') : '문구 촬영 또는 이미지 업로드'
      }
      className="w-[min(680px,100%)]"
    >
      {imageUrl ? (
        extracting ? (
          <CaptureExtracting imageUrl={imageUrl} onCancel={resetImage} />
        ) : (
          // extracting=false 로 전환될 때 새로 마운트되므로 비제어 textarea 의 defaultValue 가
          // 그 시점의 추출 텍스트로 채워진다(같은 컴포넌트 재사용으로 바꾸면 깨지니 분기 유지).
          <CaptureReview
            imageUrl={imageUrl}
            initialContent={extractedText}
            books={books}
            booksLoading={booksLoading}
            onRetake={resetImage}
            onSave={saveHighlight}
            onLater={onClose}
            pending={pending}
          />
        )
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <CapturePath
              icon="camera"
              title="사진 촬영"
              sub="카메라로 책장을 찍어서 한 줄 추출"
              onClick={() => cameraRef.current?.click()}
            />
            <CapturePath
              icon="image-up"
              title="이미지 업로드"
              sub="갤러리에 있는 사진을 불러와요"
              onClick={() => fileRef.current?.click()}
            />
          </div>

          <button
            type="button"
            aria-label="이미지 파일 선택 또는 드래그앤드롭"
            onClick={() => fileRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              selectImage(e.dataTransfer.files?.[0]);
            }}
            className={cnDropzone(dragging)}
          >
            <Icon name="upload-cloud" size={28} className="text-ink-500" />
            <div className="text-ink-800 mt-2 text-[14px] font-semibold">
              이미지를 여기로 끌어다 놓아도 돼요
            </div>
            <div className="text-fg-3 mt-1 font-mono text-[12px]">JPG · PNG · HEIC · 최대 12MB</div>
          </button>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="카메라로 사진 촬영"
            className="hidden"
            onChange={(e) => {
              selectImage(e.target.files?.[0]);
              e.target.value = ''; // 같은 파일 재선택 시에도 onChange 재발화
            }}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            aria-label="갤러리에서 이미지 선택"
            className="hidden"
            onChange={(e) => {
              selectImage(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </>
      )}
    </ModalShell>
  );
}

function cnDropzone(dragging: boolean) {
  return [
    'flex w-full flex-col items-center rounded-[14px] border-[1.5px] border-dashed bg-surface px-[18px] py-7 text-center transition-colors',
    dragging
      ? 'border-accent bg-leaf-50'
      : 'border-divider-strong hover:border-accent hover:bg-leaf-50',
  ].join(' ');
}

function CapturePath({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-divider-strong bg-bg-elevated hover:border-accent hover:bg-leaf-50 rounded-[14px] border px-[18px] pt-[18px] pb-4 text-left transition-colors"
    >
      <span className="bg-leaf-100 text-leaf-700 mb-3 grid size-10 place-content-center rounded-xl">
        <Icon name={icon} size={22} />
      </span>
      <div className="text-ink-900 mb-1 text-[15px] font-bold tracking-[-0.01em]">{title}</div>
      <div className="text-fg-2 text-[12px] leading-[1.5]">{sub}</div>
    </button>
  );
}

/** Vision 추출 중 화면 — 미리보기 + 진행 안내. */
function CaptureExtracting({ imageUrl, onCancel }: { imageUrl: string; onCancel: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="border-divider relative h-40 w-32 overflow-hidden rounded-[12px] border">
        {/* 업로드한 blob 미리보기 — next/image 부적합이라 img 사용 */}
        <img src={imageUrl} alt="담은 사진" className="h-full w-full object-cover" />
        <div className="bg-ink-900/40 absolute inset-0 grid place-content-center">
          <Icon name="scan-text" size={28} className="animate-pulse text-white" />
        </div>
      </div>
      <div>
        <div className="text-ink-900 text-[15px] font-semibold">사진에서 구절을 읽고 있어요…</div>
        <div className="text-fg-2 mt-1 text-[13px]">잠시만 기다려 주세요</div>
      </div>
      <Button variant="ghost" onClick={onCancel}>
        다른 사진 고르기
      </Button>
    </div>
  );
}

function CaptureReview({
  imageUrl,
  initialContent,
  books,
  booksLoading,
  onRetake,
  onSave,
  onLater,
  pending,
}: {
  imageUrl: string;
  /** Vision 으로 추출한 구절(없으면 빈 문자열 — 사용자가 직접 입력) */
  initialContent: string;
  books: BookOption[];
  booksLoading: boolean;
  onRetake: () => void;
  onSave: (data: CaptureData) => void;
  onLater: () => void;
  pending: boolean;
}) {
  const ocrRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);
  const [bookId, setBookId] = useState('');
  const noBooks = !booksLoading && books.length === 0;

  // 리뷰 단계 진입 시 인식 문장으로 포커스 이동
  useEffect(() => ocrRef.current?.focus(), []);
  // 책장이 로드되면 첫 책을 기본 선택(이미 고른 값은 유지)
  useEffect(() => {
    setBookId((prev) => (prev ? prev : (books[0]?.id ?? '')));
  }, [books]);

  const submit = () => {
    if (!bookId) {
      toast('담을 책을 먼저 선택해 주세요');
      return;
    }
    const content = ocrRef.current?.value.trim() ?? '';
    if (!content) {
      toast('담을 문장을 입력해 주세요');
      return;
    }
    const trimmedPage = pageRef.current?.value.trim() ?? '';
    onSave({ bookId, content, page: trimmedPage.length > 0 ? trimmedPage : null });
  };

  return (
    <div>
      <div className="grid grid-cols-[200px_1fr] gap-4 max-[560px]:grid-cols-1">
        <div className="border-divider relative overflow-hidden rounded-[12px] border">
          {/* 업로드한 blob 미리보기 — next/image 부적합이라 img 사용. 로드 실패 시 업로드로 복귀 */}
          <img
            src={imageUrl}
            alt="담은 사진"
            onError={onRetake}
            className="h-full w-full object-cover"
          />
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            aria-label="다시 고르기"
            onClick={onRetake}
            className="bg-bg-elevated/90 absolute top-2 right-2"
          >
            <Icon name="refresh-cw" size={16} />
          </Button>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="block">
            <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">
              {initialContent ? '인식된 문장' : '문장 입력'}
            </span>
            <textarea
              ref={ocrRef}
              aria-label="담을 문장"
              defaultValue={initialContent}
              placeholder={
                initialContent ? undefined : '사진에서 구절을 찾지 못했어요. 직접 입력해 주세요.'
              }
              rows={3}
              className="bg-bg-elevated text-ink-900 focus:border-leaf-400 border-field-border w-full rounded-[10px] border p-3 font-serif text-[15px] leading-[1.6] outline-none focus:shadow-[0_0_0_2px_var(--accent-ring)]"
            />
          </label>

          <label className="block">
            <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">책</span>
            {noBooks ? (
              <p className="border-field-border text-fg-2 rounded-[10px] border border-dashed px-3 py-2.5 text-[13px] leading-[1.5]">
                담을 책이 없어요. 먼저 <b className="text-ink-900">책 추가</b>로 책장에 책을
                담아주세요.
              </p>
            ) : (
              <Select
                aria-label="책 선택"
                value={bookId}
                onChange={setBookId}
                options={books.map((b) => ({ value: b.id, label: b.label }))}
                placeholder={booksLoading ? '책장 불러오는 중…' : '책 선택'}
                disabled={booksLoading}
                className="w-full"
              />
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">페이지</span>
              <Input ref={pageRef} placeholder="예: 42" inputMode="numeric" aria-label="페이지" />
            </label>
            <label className="block">
              <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">태그</span>
              {/* TODO(highlight): 태그 도메인 도입 후 활성화 — 현재 미저장이라 비활성 */}
              <Input placeholder="곧 제공돼요" aria-label="태그" disabled />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onRetake} disabled={pending}>
          다시 고르기
        </Button>
        <Button variant="secondary" onClick={onLater} disabled={pending}>
          나중에 정리
        </Button>
        <Button variant="primary" onClick={submit} disabled={pending || noBooks}>
          <Icon name="check" size={16} />
          {pending ? '저장 중…' : '한 줄 저장'}
        </Button>
      </div>
    </div>
  );
}

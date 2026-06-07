'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Icon, type IconName } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import { captureHighlight } from '@/app/(dashboard)/highlights/actions';

// TODO(capture): 이미지 선택 후 Claude vision 으로 구절 추출한 결과로 대체
const SAMPLE_OCR = '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.';
// TODO(capture): 사용자 책장 조회 유스케이스 결과로 대체. value 는 Book.id(uuid) — books 테이블 도입 전이라 샘플 uuid.
const BOOK_OPTIONS = [
  { value: '11111111-1111-4111-8111-111111111111', label: '일곱 해의 마지막 · 김연수' },
  { value: '22222222-2222-4222-8222-222222222222', label: '아주 사적인 독서 · 이현우' },
  { value: '33333333-3333-4333-8333-333333333333', label: '바깥은 여름 · 김애란' },
];

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
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // objectURL 누수 방지
  useEffect(() => {
    if (!imageUrl) return;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const selectImage = (file?: File) => {
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  };

  // 검토한 텍스트를 Highlight 로 저장(Server Action → 유스케이스). 사진 업로드는 후속.
  const saveHighlight = (data: CaptureData) => {
    void (async () => {
      setPending(true);
      const result = await captureHighlight(data);
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
      title={imageUrl ? '문장 확인' : '문구 촬영 또는 이미지 업로드'}
      className="w-[min(680px,100%)]"
    >
      {imageUrl ? (
        <CaptureReview
          imageUrl={imageUrl}
          onRetake={() => setImageUrl(null)}
          onSave={saveHighlight}
          onLater={onClose}
          pending={pending}
        />
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

function CaptureReview({
  imageUrl,
  onRetake,
  onSave,
  onLater,
  pending,
}: {
  imageUrl: string;
  onRetake: () => void;
  onSave: (data: CaptureData) => void;
  onLater: () => void;
  pending: boolean;
}) {
  const ocrRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);
  const [bookId, setBookId] = useState(BOOK_OPTIONS[0]!.value);
  // 리뷰 단계 진입 시 인식 문장으로 포커스 이동
  useEffect(() => ocrRef.current?.focus(), []);

  const submit = () => {
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
          {/* 업로드한 blob 미리보기 — next/image 부적합이라 img 사용 */}
          <img src={imageUrl} alt="담은 사진" className="h-full w-full object-cover" />
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
            <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">인식된 문장</span>
            <textarea
              ref={ocrRef}
              aria-label="인식된 문장"
              defaultValue={SAMPLE_OCR}
              rows={3}
              className="bg-bg-elevated text-ink-900 focus:border-leaf-400 border-field-border w-full rounded-[10px] border p-3 font-serif text-[15px] leading-[1.6] outline-none focus:shadow-[0_0_0_2px_var(--accent-ring)]"
            />
          </label>

          <label className="block">
            <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">책</span>
            <Select
              aria-label="책 선택"
              value={bookId}
              onChange={setBookId}
              options={BOOK_OPTIONS}
              className="w-full"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">페이지</span>
              <Input ref={pageRef} placeholder="예: 42" inputMode="numeric" aria-label="페이지" />
            </label>
            <label className="block">
              <span className="text-fg-3 mb-1.5 block text-[12px] font-semibold">태그</span>
              <Input placeholder="#소설 #문장수집" aria-label="태그" />
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
        <Button variant="primary" onClick={submit} disabled={pending}>
          <Icon name="check" size={16} />
          {pending ? '저장 중…' : '한 줄 저장'}
        </Button>
      </div>
    </div>
  );
}

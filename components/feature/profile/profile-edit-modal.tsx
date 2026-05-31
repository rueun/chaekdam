'use client';

import { useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';

const BIO_MAX = 80;

/** 프로필 수정 모달을 띄운다. (사이드바 프로필 카드 · 설정 계정 카드 공용) */
export function openProfileEdit() {
  overlay.open(({ isOpen, unmount }) => <ProfileEditModal isOpen={isOpen} onClose={unmount} />);
}

function ProfileEditModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('홍길동');
  const [bio, setBio] = useState('3년차 UI/UX 디자이너 · 종이책 애호가');

  // TODO(profile): 프로필 갱신 유스케이스 호출로 교체
  const save = () => {
    onClose();
    toast('프로필을 저장했어요');
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="계정"
      title="프로필 수정"
      className="w-[min(560px,100%)]"
    >
      <div className="border-divider mb-5 flex items-center gap-3.5 border-b pb-5">
        <div className="bg-leaf-100 text-leaf-700 relative grid size-16 shrink-0 place-content-center rounded-full font-serif text-[26px] font-bold">
          홍
          <span className="bg-accent absolute right-0 bottom-0 grid size-6 place-content-center rounded-full text-white ring-2 ring-[var(--bg-elevated)]">
            <Icon name="pen-line" size={12} />
          </span>
        </div>
        <div className="text-fg-2 text-[12px] leading-[1.6]">
          <b className="text-ink-900 mb-1 block font-semibold">프로필 사진</b>
          JPG · PNG · 최대 4MB. 정사각형으로 자동 자릅니다.
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-fg-3 text-[12px] font-semibold">이름</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="이름" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-fg-3 text-[12px] font-semibold">한 줄 소개</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={2}
            aria-label="한 줄 소개"
            className="border-field-border bg-bg-elevated text-ink-900 focus:border-leaf-400 w-full resize-none rounded-[10px] border p-3 text-[14px] leading-[1.6] outline-none focus:shadow-[0_0_0_2px_var(--accent-ring)]"
          />
          <span className="text-fg-3 text-right font-mono text-[11px]">
            {bio.length}/{BIO_MAX}
          </span>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" onClick={save}>
          <Icon name="check" size={16} />
          변경 저장
        </Button>
      </div>
    </ModalShell>
  );
}

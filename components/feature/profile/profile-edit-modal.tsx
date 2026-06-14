'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import { ModalShell } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toast';
import type { CurrentUserView } from '@/components/feature/profile/user-view';
import { BIO_MAX } from '@/lib/application/user/schemas';
import { updateProfile } from '@/app/(dashboard)/settings/actions';

type ProfileInitial = Pick<CurrentUserView, 'name' | 'bio' | 'initial'>;

/** 프로필 수정 모달을 띄운다. (사이드바 프로필 카드 · 설정 계정 카드 공용) */
export function openProfileEdit(initial: ProfileInitial) {
  overlay.open(({ isOpen, unmount }) => (
    <ProfileEditModal isOpen={isOpen} onClose={unmount} initial={initial} />
  ));
}

function ProfileEditModal({
  isOpen,
  onClose,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial: ProfileInitial;
}) {
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  // 저장 진행 중 외부 dismiss(overlay unmount) 시 setState 경합 방지.
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setErrors({});
    const result = await updateProfile({ name, bio });
    if (!mountedRef.current) return;

    if (result.ok) {
      onClose();
      toast('프로필을 저장했어요');
      return;
    }
    setSaving(false);
    if (result.fieldErrors) {
      setErrors(result.fieldErrors);
      return;
    }
    toast(result.error ?? '프로필 저장에 실패했어요');
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
          {initial.initial}
          <span
            aria-hidden
            className="bg-accent absolute right-0 bottom-0 grid size-6 place-content-center rounded-full text-white ring-2 ring-[var(--bg-elevated)]"
          >
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
          {errors.name?.[0] ? (
            <span className="text-danger text-[12px]">{errors.name[0]}</span>
          ) : null}
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
          {errors.bio?.[0] ? (
            <span className="text-danger text-[12px]">{errors.bio[0]}</span>
          ) : null}
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button variant="primary" onClick={() => void save()} disabled={saving}>
          <Icon name="check" size={16} />
          {saving ? '저장 중…' : '변경 저장'}
        </Button>
      </div>
    </ModalShell>
  );
}

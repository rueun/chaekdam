'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { toast } from '@/components/ui/toast';
import { openConfirm } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils/cn';
import { PersonaPicker } from '@/components/feature/persona/persona-picker';
import type { PersonaKey } from '@/components/feature/persona/personas';
import { openProfileEdit } from '@/components/feature/profile/profile-edit-modal';
import { signOut } from '@/app/(auth)/actions';

/**
 * 설정 화면 — 계정 · AI 독서토론(기본 페르소나) · 데이터(위험).
 * INTERACTIONS.md C-설정: 프로필 수정 모달 / 기록 내보내기 토스트 / 데이터 삭제 확인 모달(타이핑).
 */
export function SettingsView() {
  // TODO(settings): 사용자 설정 조회·갱신 유스케이스로 대체
  const [persona, setPersona] = useState<PersonaKey>('socrates');

  const exportData = () => toast('내보내기 파일을 준비하고 있어요');

  const deleteData = async () => {
    const confirmed = await openConfirm({
      title: '모든 독서 기록을 삭제할까요?',
      body: (
        <>
          이번 해 독서 기록, 한 줄 312개, AI 토론 기록을 포함한 모든 데이터가 영구히 삭제돼요.{' '}
          <b>되돌릴 수 없어요.</b>
        </>
      ),
      confirmText: '데이터 삭제',
      requireType: '책담 삭제',
    });
    // TODO(settings): 확인 시 계정 데이터 삭제 유스케이스 호출
    if (confirmed) toast('모든 데이터를 삭제했어요');
  };

  return (
    <div className="flex max-w-[880px] flex-col gap-5">
      {/* 계정 */}
      <SettingsCard title="계정">
        <SettingsRow>
          <div className="bg-leaf-100 text-leaf-700 grid size-11 shrink-0 place-content-center rounded-full font-serif text-[18px] font-bold">
            홍
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-ink-900 text-[14px] font-medium">홍길동</div>
            <div className="text-fg-3 mt-0.5 text-[12px]">reader@chaekdam.kr</div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => void signOut()}>
              로그아웃
            </Button>
            <Button variant="secondary" onClick={openProfileEdit}>
              프로필 수정
            </Button>
          </div>
        </SettingsRow>
      </SettingsCard>

      {/* AI 독서토론 — 기본 페르소나 */}
      <SettingsCard title="AI 독서토론">
        <p className="text-fg-2 -mt-1 mb-4 text-[13px] leading-[1.6]">
          새 대화를 시작할 때 기본으로 부를 토론자예요. 한 책에 여러 대화방을 둘 수 있고, 대화방을
          시작한 뒤엔 토론자를 바꿀 수 없어요.
        </p>
        <div className="mb-1">
          <PersonaPicker value={persona} onChange={setPersona} aria-label="기본 토론자 선택" />
        </div>
        <SettingsRow>
          <div className="min-w-0 flex-1">
            <div className="text-ink-900 text-[14px] font-medium">자동 토론 시작</div>
            <div className="text-fg-3 mt-0.5 text-[12px]">완독 후 토론자가 먼저 질문</div>
          </div>
          <Toggle aria-label="자동 토론 시작" />
        </SettingsRow>
      </SettingsCard>

      {/* 데이터 (위험) */}
      <SettingsCard title="데이터" danger>
        <SettingsRow>
          <div className="min-w-0 flex-1">
            <div className="text-ink-900 text-[14px] font-medium">기록 내보내기</div>
            <div className="text-fg-3 mt-0.5 text-[12px]">JSON · CSV로 저장</div>
          </div>
          <Button variant="secondary" onClick={exportData}>
            내보내기
          </Button>
        </SettingsRow>
        <SettingsRow>
          <div className="min-w-0 flex-1">
            <div className="text-ink-900 text-[14px] font-medium">모든 데이터 삭제</div>
            <div className="text-fg-3 mt-0.5 text-[12px]">복구할 수 없습니다</div>
          </div>
          <Button variant="danger" onClick={() => void deleteData()}>
            데이터 삭제
          </Button>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

function SettingsCard({
  title,
  danger,
  children,
}: {
  title: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border-divider bg-bg-elevated rounded-[14px] border px-6 pt-[18px] pb-1.5">
      <h3
        className={cn(
          'mb-1.5 text-[13px] font-bold tracking-[0.04em] uppercase',
          danger ? 'text-danger' : 'text-fg-3',
        )}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 라벨/설명 + 우측 컨트롤 한 줄. 마지막 행은 하단 보더 없음. */
function SettingsRow({ children }: { children: ReactNode }) {
  return (
    <div className="border-divider flex items-center gap-4 border-b py-3.5 last:border-b-0">
      {children}
    </div>
  );
}

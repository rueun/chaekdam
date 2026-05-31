'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';

type TimerState = 'idle' | 'running' | 'paused';

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * 독서 세션 타이머 — '분'(리더 체류 시간) 기록. idle → running ⇄ paused → (종료) idle.
 * 사용자가 명시적으로 시작/일시정지/종료한다. 탭이 숨겨지면(읽지 않는 시간) 자동 일시정지.
 * 시간은 타임스탬프 누적으로 계산해 드리프트를 피한다.
 * (데모: 로컬 카운트. 실연동 시 onStop 으로 ReadingSession 기록 유스케이스 호출.)
 */
export function SessionTimer({ onStop }: { onStop?: (elapsedSeconds: number) => void }) {
  const [state, setState] = useState<TimerState>('idle');
  const [displaySecs, setDisplaySecs] = useState(0);
  const accumulatedRef = useRef(0); // 현재 구간 이전까지 누적된 초
  const runStartRef = useRef<number | null>(null); // 현재 running 구간 시작 시각

  const elapsedNow = () =>
    accumulatedRef.current +
    (runStartRef.current === null ? 0 : (Date.now() - runStartRef.current) / 1000);

  const startOrResume = () => {
    runStartRef.current = Date.now();
    setState('running');
  };
  const pause = () => {
    accumulatedRef.current = elapsedNow();
    runStartRef.current = null;
    setDisplaySecs(Math.floor(accumulatedRef.current));
    setState('paused');
  };
  const stop = () => {
    onStop?.(Math.floor(elapsedNow()));
    accumulatedRef.current = 0;
    runStartRef.current = null;
    setDisplaySecs(0);
    setState('idle');
  };

  // running 중 표시 갱신
  useEffect(() => {
    if (state !== 'running') return;
    setDisplaySecs(Math.floor(elapsedNow()));
    const id = setInterval(() => setDisplaySecs(Math.floor(elapsedNow())), 1000);
    return () => clearInterval(id);
  }, [state]);

  // 탭 숨김 시 자동 일시정지 (읽지 않는 시간은 집계하지 않음)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && runStartRef.current !== null) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={startOrResume}
        title="이 책을 읽기 시작했어요"
        className="border-leaf-100 bg-leaf-50 text-accent hover:bg-leaf-100 inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors"
      >
        <Icon name="play" size={14} />
        기록 시작
      </button>
    );
  }

  const paused = state === 'paused';
  return (
    <span
      aria-label={`이번 세션 ${formatElapsed(displaySecs)}${paused ? ', 일시정지됨' : ''}`}
      className="border-leaf-100 bg-surface text-ink-800 inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium"
    >
      <span
        className={cn(
          'size-[7px] rounded-full',
          paused ? 'bg-paper-400' : 'bg-leaf-500 animate-pulse',
        )}
        aria-hidden
      />
      <span className={cn('text-[11px] tracking-[0.04em]', paused ? 'text-fg-2' : 'text-fg-3')}>
        이번 세션
      </span>
      <span
        className={cn('font-mono font-bold tabular-nums', paused ? 'text-fg-2' : 'text-ink-900')}
      >
        {formatElapsed(displaySecs)}
      </span>
      <span className="bg-divider-strong mx-0.5 ml-1.5 h-3.5 w-px" aria-hidden />
      <button
        type="button"
        onClick={paused ? startOrResume : pause}
        aria-label={paused ? '이어서 기록' : '일시 중지'}
        className="text-fg-2 hover:bg-surface-2 hover:text-ink-900 inline-flex items-center justify-center rounded-md p-0.5 transition-colors"
      >
        <Icon name={paused ? 'play' : 'pause'} size={12} />
      </button>
      <button
        type="button"
        onClick={stop}
        aria-label="기록 끝내기"
        className="text-fg-2 hover:bg-surface-2 hover:text-ink-900 inline-flex items-center justify-center rounded-md p-0.5 transition-colors"
      >
        <Icon name="square" size={12} />
      </button>
    </span>
  );
}

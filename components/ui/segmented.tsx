'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  /** 제어 모드 값. 생략하면 비제어(내부 상태) */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * 세그먼티드 컨트롤 — 단일 선택(radiogroup).
 *
 * 라디오 그룹 패턴: 선택 항목만 tab 가능(roving tabindex), ←→↑↓ 로 이동·선택.
 * 스타일은 디자인시스템 CSS(`.seg`/`.s`).
 */
export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const current = isControlled ? value : internal;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentIndex = options.findIndex((o) => o.value === current);
  const focusableIndex = currentIndex >= 0 ? currentIndex : 0;

  const selectOption = (index: number, moveFocus = false) => {
    const opt = options[index];
    if (!opt) return;
    if (!isControlled) setInternal(opt.value);
    onChange?.(opt.value);
    if (moveFocus) refs.current[index]?.focus();
  };

  // APG radiogroup 패턴: 화살표 이동 시 포커스 이동과 동시에 선택을 변경한다.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (i - 1 + options.length) % options.length;
    if (next >= 0) {
      e.preventDefault();
      selectOption(next, true);
    }
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('seg', className)}>
      {options.map((opt, i) => {
        const on = opt.value === current;
        return (
          <button
            key={opt.value}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === focusableIndex ? 0 : -1}
            className={cn('s', on && 'is-on')}
            onClick={() => selectOption(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

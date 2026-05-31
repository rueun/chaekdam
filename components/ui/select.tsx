'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  /** 제어 모드 값. 생략하면 비제어(내부 상태) */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * 커스텀 드롭다운 Select (listbox).
 *
 * 네이티브 `<select>` 의 OS 드롭다운 대신 디자인시스템 `.sel`(트리거) + `.sel-menu`(목록)로
 * 펼친 목록까지 스타일링한다. 키보드(↑↓/Home/End/Enter/Esc)·바깥 클릭 닫기·포커스 복귀 지원.
 * 폼 연동은 react-hook-form `Controller` 로 (네이티브 ref 직결 아님).
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = '선택',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();

  const selectedIndex = options.findIndex((o) => o.value === current);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // 메뉴를 열며 초기 하이라이트 설정 (toLast=true 면 마지막 항목)
  const openMenu = (toLast = false) => {
    if (disabled || options.length === 0) return;
    setActiveIndex(toLast ? options.length - 1 : selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  // 열릴 때 목록에 포커스 (초기 activeIndex 는 openMenu 에서 설정됨)
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  const close = (focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const selectOption = (index: number) => {
    const opt = options[index];
    if (!opt) return;
    if (!isControlled) setInternal(opt.value);
    onChange?.(opt.value);
    close(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu(true);
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (options.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectOption(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        break;
    }
  };

  const triggerId = `${baseId}-trigger`;
  const listId = `${baseId}-list`;

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="sel"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={cn(!selected && 'text-[var(--fg-3)]')}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined}
          className="sel-menu absolute top-[calc(100%+6px)] left-0 z-50"
          onKeyDown={onListKeyDown}
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${baseId}-opt-${i}`}
              role="option"
              aria-selected={opt.value === current}
              className={cn(
                'item',
                opt.value === current && 'is-selected',
                i === activeIndex && 'is-hover',
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectOption(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

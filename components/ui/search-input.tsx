import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils/cn';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 알약형(상단바용) */
  pill?: boolean;
  /** 지정 + 값이 있으면 우측에 지우기 버튼 노출 */
  onClear?: () => void;
  /** 바깥 컨테이너 클래스 */
  containerClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * 검색 입력 — 좌측 돋보기 아이콘(배경) + 선택적 지우기 버튼.
 * 컨테이너(`.search`)가 포커스 링을 그린다. 핸들러는 호출자가 주입.
 */
export function SearchInput({
  pill = false,
  onClear,
  containerClassName,
  className,
  type = 'search',
  ref,
  value,
  ...props
}: SearchInputProps) {
  const showClear = Boolean(onClear) && Boolean(value);
  return (
    <div className={cn('search', pill && 'search-pill', containerClassName)}>
      <input ref={ref} type={type} value={value} className={className} {...props} />
      {showClear ? (
        <button type="button" className="clear" onClick={onClear} aria-label="지우기">
          ×
        </button>
      ) : null}
    </div>
  );
}

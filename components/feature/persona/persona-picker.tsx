'use client';

import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { PERSONAS, PERSONA_ORDER, type PersonaKey } from './personas';

interface PersonaPickerProps {
  value: PersonaKey;
  onChange: (value: PersonaKey) => void;
  /** 같은 화면에 여러 라디오 그룹이 있을 때 구분용 */
  name?: string;
  'aria-label'?: string;
}

/**
 * AI 토론 페르소나 선택 — 4종 카드 라디오 그룹(ADR-009).
 * 설정의 기본 토론자 선택과 새 대화 모달에서 공유한다.
 * 선택 상태는 제어값(value)으로 그리고, 네이티브 radio 는 폼·접근성 시맨틱용.
 */
export function PersonaPicker({
  value,
  onChange,
  name = 'persona',
  'aria-label': ariaLabel = '기본 토론자 선택',
}: PersonaPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1"
    >
      {PERSONA_ORDER.map((key) => {
        const persona = PERSONAS[key];
        const selected = value === key;
        return (
          <label
            key={key}
            className={cn(
              'relative flex cursor-pointer flex-col gap-2.5 rounded-[14px] border-2 p-4 pb-3.5 transition-colors',
              selected
                ? 'border-accent bg-leaf-50'
                : 'border-divider-strong hover:border-paper-400',
            )}
          >
            <input
              type="radio"
              name={name}
              value={key}
              checked={selected}
              onChange={() => onChange(key)}
              aria-label={persona.name}
              className="border-paper-300 checked:border-accent checked:bg-accent absolute top-3.5 right-3.5 size-[18px] cursor-pointer appearance-none rounded-full border-[1.5px] bg-white checked:shadow-[inset_0_0_0_3.5px_#fff]"
            />
            {persona.badge ? (
              <span className="bg-clay-100 text-clay-700 absolute top-3.5 right-10 rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-[0.04em]">
                {persona.badge}
              </span>
            ) : null}

            <div className="flex items-start gap-3 pr-7">
              <span
                className={cn(
                  'grid size-9 shrink-0 place-content-center rounded-[10px]',
                  selected ? 'bg-accent text-white' : 'bg-leaf-50 text-accent',
                )}
              >
                <Icon name={persona.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-ink-900 font-serif text-[16px] font-semibold tracking-[-0.02em]">
                  {persona.name}
                </div>
                <div className="text-fg-2 mt-0.5 text-[11px] tracking-[0.02em]">{persona.role}</div>
              </div>
            </div>

            <p className="text-fg-2 text-[12.5px] leading-[1.6]">{persona.blurb}</p>

            <div
              className={cn(
                'text-ink-700 relative mt-auto rounded-[10px] border py-2.5 pr-3 pl-[22px] font-serif text-[13px] leading-[1.55] italic',
                selected ? 'border-leaf-100 bg-white' : 'bg-paper-100 border-transparent',
              )}
            >
              <span
                className="text-paper-400 absolute top-1 left-[9px] font-serif text-[22px] leading-none"
                aria-hidden
              >
                “
              </span>
              {persona.preview}
            </div>
          </label>
        );
      })}
    </div>
  );
}

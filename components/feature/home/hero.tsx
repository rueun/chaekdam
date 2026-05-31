import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/lib/router/routes';

interface HeroProps {
  /** 오늘 읽은 분 */
  minutesToday?: number;
  /** 어제 대비 증감(분) */
  deltaMinutes?: number;
  /** 캡처(한 줄 담기) 액션 슬롯 — 페이지에서 주입(feature 결합 회피, ADR-006) */
  captureActions?: ReactNode;
}

/**
 * 홈 Hero — '오늘의 한 줄' 인용 + 읽은 분 통계 + 진입 액션.
 * 인용 카피는 추후 '오늘의 한 줄' 데이터로 대체 예정(현재는 샘플).
 * 스타일은 디자인시스템 CSS(`.hero`).
 */
export function Hero({ minutesToday = 24, deltaMinutes = 6, captureActions }: HeroProps) {
  const deltaText = deltaMinutes === 0 ? '어제와 같아요' : `어제보다 ${Math.abs(deltaMinutes)}분`;

  return (
    <div className="hero">
      <div>
        <div className="eyebrow">오늘의 한 줄</div>
        <h2>
          읽기는 결국 <span className="mark-underline">자신을 발견하는</span> 일.
          <br />
          오늘은 어디까지 닿았나요?
        </h2>
        <p>읽고 있던 페이지로 돌아가거나, 어제 그은 문장을 다시 읽어볼 수 있어요.</p>
        <div className="hero-actions">
          <Link href={ROUTES.READING()} className={cn('btn', 'btn-primary')}>
            <Icon name="book-open" size={16} />
            이어 읽기
          </Link>
          {captureActions}
        </div>
      </div>
      <div className="hero-stat">
        <div className="big">{minutesToday}</div>
        <div className="lbl">오늘 읽은 분</div>
        <div
          className={cn('delta', deltaMinutes < 0 && 'is-down', deltaMinutes === 0 && 'is-flat')}
        >
          {deltaMinutes !== 0 ? (
            <>
              <span aria-hidden="true">{deltaMinutes > 0 ? '▲ ' : '▼ '}</span>
              <span className="sr-only">{deltaMinutes > 0 ? '증가, ' : '감소, '}</span>
            </>
          ) : null}
          {deltaText}
        </div>
      </div>
    </div>
  );
}

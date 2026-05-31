import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export interface HighlightView {
  id: string;
  /** 구절 본문 (도메인 Highlight.content) */
  content: string;
  /** content 안에서 강조할 부분(첫 일치만) */
  emphasis?: string;
  author: string;
  book: string;
  /** 페이지 표기 (예: 'p.42') */
  page: string;
}

/** emphasis 가 있으면 content 의 해당 부분을 <mark> 로 감싼다 (없거나 공백뿐이면 원문). */
function markEmphasis(content: string, emphasis?: string): ReactNode {
  if (!emphasis?.trim()) return content;
  const index = content.indexOf(emphasis);
  if (index < 0) return content;
  return (
    <>
      {content.slice(0, index)}
      <mark>{emphasis}</mark>
      {content.slice(index + emphasis.length)}
    </>
  );
}

interface HighlightCardProps {
  highlight: HighlightView;
  /** 더보기 메뉴 핸들러 (없으면 더보기 버튼 미표시) */
  onMore?: () => void;
}

/**
 * 담은 '한 줄'(Highlight) 카드 — 개인 기록용. 본문 + 출처 + (선택)더보기.
 * 스타일은 디자인시스템 CSS(`.quote-card`).
 */
export function HighlightCard({ highlight, onMore }: HighlightCardProps) {
  return (
    <article className="quote-card">
      <div className="q-text">{markEmphasis(highlight.content, highlight.emphasis)}</div>
      <div className="q-meta">
        <div>
          <b>{highlight.author}</b>{' '}
          <span className="author">
            · {highlight.book} · {highlight.page}
          </span>
        </div>
        {onMore ? (
          <div className="q-actions">
            <Button variant="ghost" iconOnly size="sm" aria-label="더보기" onClick={onMore}>
              <Icon name="more-horizontal" size={16} />
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

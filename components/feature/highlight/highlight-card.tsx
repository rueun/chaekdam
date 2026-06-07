'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { openQuoteMenu } from '@/components/ui/quote-menu';
import { openConfirm } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/toast';

export interface HighlightView {
  id: string;
  /** 구절 본문 (도메인 Highlight.content) */
  content: string;
  /** content 안에서 강조할 부분(첫 일치만) */
  emphasis?: string;
  /** 저자 (책 메타가 있을 때만 — books 테이블 도입 전 DB 한 줄엔 없음) */
  author?: string;
  /** 책 제목 (위와 동일) */
  book?: string;
  /** 페이지 표기 (예: 'p.42') */
  page?: string;
  /** 책 메타가 없을 때 보조 메타로 쓰는 날짜 라벨(예: '6월 7일') */
  dateLabel?: string;
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
}

/**
 * 담은 '한 줄'(Highlight) 카드 — 개인 기록용. 본문 + 출처 + 더보기 메뉴(QuoteMenu).
 * 메뉴 액션은 현재 토스트/복사/삭제확인 스텁 — 추후 Highlight 유스케이스로 교체.
 * 스타일은 디자인시스템 CSS(`.quote-card`).
 */
export function HighlightCard({ highlight }: HighlightCardProps) {
  // 저자 뒤에 붙는 보조 메타 — 책 제목·페이지·날짜 중 있는 것만
  const meta = [highlight.book, highlight.page, highlight.dateLabel].filter(Boolean).join(' · ');

  const openMenu = (anchor: HTMLElement) => {
    openQuoteMenu(anchor, {
      // TODO(highlight): 각 액션을 Highlight 유스케이스(수정·고정·이동·보관)로 교체
      onEdit: () => toast('문장 수정은 곧 제공돼요'),
      onPin: () => toast('홈에 고정했어요'),
      onCopy: () => {
        navigator.clipboard
          ?.writeText(highlight.content)
          .then(() => toast('문장을 복사했어요'))
          .catch(() => toast('복사에 실패했어요'));
      },
      onMove: () => toast('다른 책으로 이동은 곧 제공돼요'),
      onArchive: () => toast('보관함에 넣었어요'),
      onDelete: () => {
        void (async () => {
          const confirmed = await openConfirm({
            title: '이 한 줄을 삭제할까요?',
            body: <>삭제하면 이 문장과 메모가 함께 사라져요. 되돌릴 수 없어요.</>,
            confirmText: '삭제',
          });
          // TODO(highlight): DeleteHighlight 유스케이스 연결. 그 전까진 실제 삭제 안 됨을 정직하게 안내.
          if (confirmed) toast('삭제 기능은 곧 제공돼요');
        })();
      },
    });
  };

  return (
    <article className="quote-card">
      <div className="q-text">{markEmphasis(highlight.content, highlight.emphasis)}</div>
      <div className="q-meta">
        <div>
          {highlight.author ? <b>{highlight.author}</b> : null}
          {meta ? (
            highlight.author ? (
              <span className="author"> · {meta}</span>
            ) : (
              <span className="text-fg-3">{meta}</span>
            )
          ) : null}
        </div>
        <div className="q-actions">
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            aria-label="한 줄 메뉴 열기"
            aria-haspopup="menu"
            onClick={(e) => openMenu(e.currentTarget)}
          >
            <Icon name="more-horizontal" size={16} />
          </Button>
        </div>
      </div>
    </article>
  );
}

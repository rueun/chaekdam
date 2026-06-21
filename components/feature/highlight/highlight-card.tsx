'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router/routes';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { openQuoteMenu } from '@/components/ui/quote-menu';
import { openConfirm } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/toast';
import { openHighlightShare } from '@/components/feature/share/highlight-share-card';
import { openHighlightEdit } from '@/components/feature/highlight/highlight-edit-modal';
import { openHighlightMove } from '@/components/feature/highlight/highlight-move-modal';
import {
  deleteHighlight,
  pinHighlight,
  archiveHighlight,
} from '@/app/(dashboard)/highlights/actions';
import type { HighlightView } from './highlight-view';

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
  const router = useRouter();
  // 저자 뒤에 붙는 보조 메타 — 책 제목·페이지·날짜 중 있는 것만
  const meta = [highlight.book, highlight.page, highlight.dateLabel].filter(Boolean).join(' · ');

  const openMenu = (anchor: HTMLElement) => {
    openQuoteMenu(anchor, {
      pinned: highlight.pinned,
      archived: highlight.archived,
      onEdit: () =>
        openHighlightEdit(
          {
            id: highlight.id,
            content: highlight.content,
            page: highlight.page,
            tags: highlight.tags,
          },
          () => router.refresh(),
        ),
      onPin: () => {
        void (async () => {
          const result = await pinHighlight(highlight.id, !highlight.pinned);
          if (result.ok) {
            toast(highlight.pinned ? '고정을 해제했어요' : '홈에 고정했어요');
            router.refresh();
          } else {
            toast(result.error);
          }
        })();
      },
      onCopy: () => {
        navigator.clipboard
          ?.writeText(highlight.content)
          .then(() => toast('문장을 복사했어요'))
          .catch(() => toast('복사에 실패했어요'));
      },
      onShare: () =>
        openHighlightShare({
          content: highlight.content,
          author: highlight.author,
          book: highlight.book,
        }),
      onMove: () => openHighlightMove(highlight.id, () => router.refresh()),
      onArchive: () => {
        void (async () => {
          const result = await archiveHighlight(highlight.id, !highlight.archived);
          if (result.ok) {
            toast(highlight.archived ? '보관을 해제했어요' : '보관함에 넣었어요');
            router.refresh();
          } else {
            toast(result.error);
          }
        })();
      },
      onDelete: () => {
        void (async () => {
          const confirmed = await openConfirm({
            title: '이 한 줄을 삭제할까요?',
            body: <>삭제하면 이 문장과 메모가 함께 사라져요. 되돌릴 수 없어요.</>,
            confirmText: '삭제',
          });
          if (!confirmed) return;
          const result = await deleteHighlight(highlight.id);
          if (result.ok) {
            toast('한 줄을 삭제했어요');
            router.refresh(); // 서버 렌더 목록을 다시 불러와 삭제된 카드를 제거
          } else {
            toast(result.error);
          }
        })();
      },
    });
  };

  return (
    <article className="quote-card">
      {highlight.pinned ? (
        <div className="text-accent mb-2 inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.02em]">
          <Icon name="pin" size={12} />
          고정됨
        </div>
      ) : null}
      {highlight.photoUrl && /^https?:\/\//.test(highlight.photoUrl) ? (
        // 공개 버킷 URL(ADR-020) — next/image 설정 불필요해 img 사용. http(s) 만 허용, 실패 시 숨김.
        <img
          src={highlight.photoUrl}
          alt="담은 한 줄의 원본 사진"
          loading="lazy"
          className="border-divider mb-3 max-h-44 w-full rounded-[10px] border object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      ) : null}
      <div className="q-text">{markEmphasis(highlight.content, highlight.emphasis)}</div>
      {highlight.tags && highlight.tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {highlight.tags.map((tag) => (
            <Link
              key={tag}
              href={`${ROUTES.HIGHLIGHTS()}?tag=${encodeURIComponent(tag)}`}
              className="bg-surface text-fg-2 hover:bg-paper-100 hover:text-ink-800 rounded-full px-2 py-0.5 text-[11px] transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
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

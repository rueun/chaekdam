import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { BookCover } from '@/components/ui/book-cover';
import { ROUTES } from '@/lib/router/routes';

export interface WishlistBookView {
  /** Book.id — 위시리스트는 WISH 상태의 Book 이며 별도 엔티티가 아니다 */
  id: string;
  title: string;
  author: string;
  /** 표지 색 — CSS color. 미지정 시 잉크 톤 */
  coverColor?: string;
  /** 표지 이미지 URL(도서 API 썸네일) */
  coverImageUrl?: string;
  /** 담은 날짜 (예: '5월 11일') */
  addedAt: string;
}

/**
 * 홈 우측 레일 — 최근 담은 '읽고 싶은 책' + 더 담기. 스타일은 `.rail-card`/`.wish-card`.
 * '책 더 담기' 액션은 슬롯(footAction)으로 주입받아 book-search 기능과 결합하지 않는다(ADR-006).
 */
export function WishlistCard({
  items,
  footAction,
}: {
  items: WishlistBookView[];
  footAction?: ReactNode;
}) {
  const isEmpty = items.length === 0;

  return (
    <div className="rail-card wish-card">
      <div className="wish-card-head">
        <h3>읽고 싶은 책</h3>
        {!isEmpty ? (
          <Link href={ROUTES.WISHLIST()} className="wish-more" aria-label="읽고 싶은 책 전체 보기">
            전체 보기 <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      {isEmpty ? (
        <p className="text-body-sm text-fg-2 py-2">아직 담아둔 책이 없어요.</p>
      ) : (
        items.map((item) => (
          <div className="rec-row wish-row" key={item.id}>
            <BookCover
              title={item.title}
              coverColor={item.coverColor}
              coverImageUrl={item.coverImageUrl}
              sizes="48px"
              className="rec-cover"
            />
            <div className="rec-info">
              <div className="t">{item.title}</div>
              <div className="a">
                {item.author} · {item.addedAt} 담음
              </div>
            </div>
            <Link
              href={ROUTES.BOOKS.DETAIL(item.id)}
              className="btn btn-ghost wish-row-action"
              aria-label={`${item.title} 지금부터 읽기`}
            >
              <Icon name="book-open" size={16} />
            </Link>
          </div>
        ))
      )}

      {footAction}
    </div>
  );
}

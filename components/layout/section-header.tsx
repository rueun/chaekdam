import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  /** 우측 '전체 보기' 링크 (없으면 표시 안 함) */
  moreHref?: string;
}

/** 섹션 제목 + 선택적 '전체 보기' 링크. 스타일은 디자인시스템 CSS(`.h-section`). */
export function SectionHeader({ title, moreHref }: SectionHeaderProps) {
  return (
    <div className="h-section">
      <h2>{title}</h2>
      {moreHref ? (
        <Link href={moreHref} aria-label={`${title} 전체 보기`}>
          전체 보기 <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

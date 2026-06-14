'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface BookCoverProps {
  title: string;
  /** 색 스파인 배경(이미지 없을 때). 미지정 시 잉크 톤 */
  coverColor?: string | null;
  /** 도서 API 썸네일 URL. 있으면 이미지를, 없거나 로딩 실패 시 색 스파인을 보여준다 */
  coverImageUrl?: string | null;
  /** 컨테이너 클래스(비율·radius·그림자·텍스트 등) */
  className?: string;
  /** next/image sizes 힌트(레이아웃 폭에 맞춰) */
  sizes?: string;
  /** 색 스파인일 때만 내부에 표시(제목 등) */
  fallback?: ReactNode;
  /** 이미지 유무와 무관하게 항상 얹는 오버레이(배지 등) */
  overlay?: ReactNode;
}

/**
 * 책 표지 — 썸네일 이미지가 있으면 표지를, 없거나 로딩 실패 시 색 스파인(폴백)을 보여준다(ADR-016).
 * 외부 이미지 호스트는 next.config 의 images.remotePatterns 로 허용한다.
 * onError 폴백을 위해 클라이언트 컴포넌트(서버 컴포넌트에서 leaf 로 렌더 가능).
 */
export function BookCover({
  title,
  coverColor,
  coverImageUrl,
  className,
  sizes = '200px',
  fallback,
  overlay,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(coverImageUrl) && !failed;

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={showImage ? undefined : { background: coverColor ?? 'var(--ink-700)' }}
    >
      {showImage ? (
        <Image
          src={coverImageUrl!}
          alt={title}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        fallback
      )}
      {overlay}
    </div>
  );
}

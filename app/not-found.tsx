import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/lib/router/routes';

/** 전역 404 — 없는 경로 진입 시 친절한 안내 + 홈 복귀. */
export default function NotFound() {
  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <span
        className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
        aria-hidden
      >
        <Icon name="search-x" size={28} />
      </span>
      <div className="text-ink-900 mt-2 font-serif text-[20px] font-semibold tracking-[-0.02em]">
        페이지를 찾을 수 없어요
      </div>
      <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
        주소가 바뀌었거나 사라진 페이지예요. 홈에서 다시 시작해보세요.
      </p>
      <Link href={ROUTES.HOME()} className="btn btn-primary mt-2">
        <Icon name="home" size={16} />
        홈으로
      </Link>
    </div>
  );
}

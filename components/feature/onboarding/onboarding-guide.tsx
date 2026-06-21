import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/icon';
import { BookSearchTrigger } from '@/components/feature/book-search/book-search-trigger';
import { CaptureTrigger } from '@/components/feature/capture/capture-trigger';
import { ROUTES } from '@/lib/router/routes';

interface Step {
  icon: IconName;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    icon: 'book-open',
    title: '책을 책장에 담기',
    desc: '읽는 중이거나 읽고 싶은 책을 찾아 담아요.',
  },
  {
    icon: 'pen-line',
    title: '마음에 닿은 한 줄 담기',
    desc: '사진을 찍거나 직접 입력해 구절을 남겨요.',
  },
  {
    icon: 'messages-square',
    title: 'AI와 토론 시작',
    desc: '담은 한 줄로 토론자와 대화를 열어요.',
  },
];

/**
 * 신규 사용자 온보딩 가이드 — 책·한 줄이 하나도 없을 때만 홈 상단에 노출(ADR-026).
 * 별도 '봤음' 플래그 없이, 첫 행동(책/한 줄 담기) 후 데이터가 생기면 자연히 사라진다.
 */
export function OnboardingGuide({ userName }: { userName: string }) {
  return (
    <section className="border-divider bg-bg-elevated mb-9 rounded-lg border p-6">
      <h2 className="text-ink-900 font-serif text-[22px] font-bold tracking-[-0.02em]">
        {userName}님, 책담에 오신 걸 환영해요
      </h2>
      <p className="text-fg-2 text-body-sm mt-1 leading-[1.6]">
        세 걸음이면 첫 독서 토론까지 닿아요.
      </p>

      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="border-divider bg-surface flex flex-col gap-2 rounded-[12px] border p-4"
          >
            <div className="flex items-center gap-2">
              <span className="bg-leaf-100 text-leaf-700 grid size-7 place-content-center rounded-full text-[12px] font-bold">
                {i + 1}
              </span>
              <Icon name={step.icon} size={18} className="text-accent" />
            </div>
            <div className="text-ink-900 text-[15px] font-semibold tracking-[-0.01em]">
              {step.title}
            </div>
            <p className="text-fg-2 text-[13px] leading-[1.5]">{step.desc}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        <BookSearchTrigger className="btn btn-primary">
          <Icon name="search" size={16} />책 찾기
        </BookSearchTrigger>
        <CaptureTrigger className="btn btn-secondary">
          <Icon name="pen-line" size={16} />한 줄 담기
        </CaptureTrigger>
        <Link href={ROUTES.DISCUSSIONS.LIST()} className="btn btn-secondary">
          <Icon name="messages-square" size={16} />
          토론 열기
        </Link>
      </div>
    </section>
  );
}

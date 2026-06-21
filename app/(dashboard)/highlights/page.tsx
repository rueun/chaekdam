import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { HighlightCard } from '@/components/feature/highlight/highlight-card';
import { HighlightList } from '@/components/feature/highlight/highlight-list';
import { HighlightsFilter } from '@/components/feature/highlight/highlights-filter';
import { Icon } from '@/components/ui/icon';
import { CaptureTrigger } from '@/components/feature/capture/capture-trigger';
import { createAuthSession } from '@/lib/infrastructure/di-container';
import { HIGHLIGHTS_PAGE_SIZE, loadHighlightViews } from './load-highlight-views';
import { ROUTES } from '@/lib/router/routes';

// 최신 데이터 반영 — 캡처 후 revalidate 와 함께 항상 최신 목록을 보여준다.
export const dynamic = 'force-dynamic';

/** 태그 필터 시 메모리 필터를 위해 한 번에 더 가져오는 상한. */
const TAG_FILTER_FETCH = 200;

export default async function HighlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; tag?: string }>;
}) {
  // 진입점 인가 게이트(미들웨어·RLS 외 1차 방어). 미인증이면 로그인으로.
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const params = await searchParams;
  const scope = params.archived === '1' ? 'archived' : 'active';
  // 비교는 소문자 기준으로 통일(태그 원본 표기는 보존, 일치만 대소문자 무시).
  const tagFilter = params.tag?.trim() ?? '';
  const tagFilterKey = tagFilter.toLowerCase();

  // 태그 필터 시엔 더 많이 가져와 메모리 필터(더보기 없음), 아니면 첫 페이지만(더보기 제공).
  const views = await loadHighlightViews(userId, scope, {
    limit: tagFilter ? TAG_FILTER_FETCH : HIGHLIGHTS_PAGE_SIZE,
    offset: 0,
  });
  // 태그 필터 — 대소문자 무시. 뷰의 태그로 필터(본격 DB 검색은 후속).
  const visible = tagFilter
    ? views.filter((v) => (v.tags ?? []).some((t) => t.toLowerCase() === tagFilterKey))
    : views;

  const isArchived = scope === 'archived';

  return (
    <>
      <TopBar
        title="밑줄 모음"
        subtitle={
          visible.length === 0
            ? '담은 한 줄이 여기에 모여요'
            : tagFilter
              ? `${visible.length}개의 문장` // 태그 필터는 전수 결과라 정확
              : '담은 한 줄을 모아둬요' // 더보기로 일부만 로드 — 총계는 표시하지 않음
        }
        action={
          <CaptureTrigger className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </CaptureTrigger>
        }
      />

      <div className="mb-5">
        <HighlightsFilter scope={scope} />
      </div>

      {tagFilter ? (
        <div className="text-fg-2 mb-4 flex items-center gap-2 text-[13px]">
          <span>
            <b className="text-ink-900 font-semibold">#{tagFilter}</b> 태그로 보는 중
          </span>
          <Link href={ROUTES.HIGHLIGHTS()} className="text-accent font-semibold hover:underline">
            필터 해제
          </Link>
        </div>
      ) : null}

      {visible.length > 0 ? (
        tagFilter ? (
          // 태그 필터 결과는 정적으로(더보기 없음 — 메모리 필터라 페이지네이션 비대상).
          <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
            {visible.map((view) => (
              <HighlightCard key={view.id} highlight={view} />
            ))}
          </div>
        ) : (
          <HighlightList initialItems={visible} scope={scope} pageSize={HIGHLIGHTS_PAGE_SIZE} />
        )
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span
            className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
            aria-hidden
          >
            <Icon name={isArchived ? 'archive' : 'quote'} size={28} />
          </span>
          <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
            {isArchived ? '보관함이 비어 있어요' : '아직 담은 한 줄이 없어요'}
          </div>
          <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
            {isArchived
              ? '한 줄 메뉴에서 보관하면 여기로 모여요. 기본 목록에서는 숨겨집니다.'
              : '마음에 닿은 문장을 사진으로 찍거나 직접 입력해 담아보세요. 여기에 차곡차곡 모여요.'}
          </p>
          {isArchived ? null : (
            <CaptureTrigger className="btn btn-primary mt-2">
              <Icon name="pen-line" size={16} />첫 한 줄 담기
            </CaptureTrigger>
          )}
        </div>
      )}
    </>
  );
}

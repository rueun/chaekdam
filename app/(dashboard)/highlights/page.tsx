import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { HighlightCard, type HighlightView } from '@/components/feature/highlight/highlight-card';
import { Icon } from '@/components/ui/icon';
import { CaptureTrigger } from '@/components/feature/capture/capture-trigger';
import {
  createAuthSession,
  createListBooksUseCase,
  createListHighlightsUseCase,
} from '@/lib/infrastructure/di-container';
import { ROUTES } from '@/lib/router/routes';

// 최신 데이터 반영 — 캡처 후 revalidate 와 함께 항상 최신 목록을 보여준다.
export const dynamic = 'force-dynamic';

/** 날짜 → '6월 7일' 라벨(KST 고정 — 서버 TZ 영향 제거). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

export default async function HighlightsPage() {
  // 진입점 인가 게이트(미들웨어·RLS 외 1차 방어). 미인증이면 로그인으로.
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const [listHighlights, listBooks] = await Promise.all([
    createListHighlightsUseCase(),
    createListBooksUseCase(),
  ]);
  const [highlights, books] = await Promise.all([listHighlights.execute(), listBooks.execute()]);

  // 한 줄을 책 메타(제목·저자)로 보강 — book_id 로 조회(여러 도메인 조합은 화면에서, ADR-006).
  const bookById = new Map(books.map((b) => [b.id, b]));
  const views: HighlightView[] = highlights.map((h) => {
    const book = bookById.get(h.bookId);
    const author = book?.author?.trim() ? book.author : undefined;
    return {
      id: h.id,
      content: h.content,
      author,
      book: book?.title,
      page: h.page ?? undefined,
      dateLabel: formatDateLabel(h.createdAt),
      photoUrl: h.photoUrl ?? undefined,
    };
  });

  return (
    <>
      <TopBar
        title="밑줄 모음"
        subtitle={views.length > 0 ? `${views.length}개의 문장` : '담은 한 줄이 여기에 모여요'}
        action={
          <CaptureTrigger className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </CaptureTrigger>
        }
      />

      {views.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
          {views.map((view) => (
            <HighlightCard key={view.id} highlight={view} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span
            className="bg-surface text-fg-3 grid size-16 place-content-center rounded-full"
            aria-hidden
          >
            <Icon name="quote" size={28} />
          </span>
          <div className="text-ink-900 mt-2 font-serif text-[18px] font-semibold tracking-[-0.02em]">
            아직 담은 한 줄이 없어요
          </div>
          <p className="text-body-sm text-fg-2 max-w-[420px] leading-[1.6]">
            마음에 닿은 문장을 사진으로 찍거나 직접 입력해 담아보세요. 여기에 차곡차곡 모여요.
          </p>
          <CaptureTrigger className="btn btn-primary mt-2">
            <Icon name="pen-line" size={16} />첫 한 줄 담기
          </CaptureTrigger>
        </div>
      )}
    </>
  );
}

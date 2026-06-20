import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { DiscussionWorkspace } from '@/components/feature/discussion-chat/discussion-workspace';
import type { DiscussionRoomView } from '@/components/feature/discussion-chat/discussion-list';
import type { MessageView } from '@/components/feature/discussion-chat/discussion-view';
import { toThread } from '@/components/feature/discussion-chat/discussion-view';
import type { NewChatBook } from '@/components/feature/discussion-chat/new-chat-modal';
import {
  createAuthSession,
  createListBooksUseCase,
  createListDiscussionsUseCase,
} from '@/lib/infrastructure/di-container';
import { BookStatus } from '@/lib/domain/book/book-status';
import { Author } from '@/lib/domain/author/author';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

const DEFAULT_COVER = 'var(--leaf-500)';

/** 날짜 → '6월 14일'(KST 고정). */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

/** 새 대화 모달에 노출할 책 — 읽는 중/완독만(토론 대상). */
function toNewChatBook(book: {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  coverColor: string | null;
}): NewChatBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    statusLabel: book.status === BookStatus.READING ? '읽는 중' : '완독',
    coverColor: book.coverColor ?? DEFAULT_COVER,
    // 사망 작가만 '작가 본인' 페르소나 활성(ADR-022, 큐레이션 판정).
    authorDeceased: Author.isDeceased(book.author),
  };
}

export default async function DiscussionsPage() {
  const userId = await (await createAuthSession()).getCurrentUserId();
  if (!userId) redirect(ROUTES.AUTH.LOGIN());

  const [listBooks, listDiscussions] = await Promise.all([
    createListBooksUseCase(),
    createListDiscussionsUseCase(),
  ]);
  const [books, discussions] = await Promise.all([listBooks.execute(), listDiscussions.execute()]);

  const bookById = new Map(books.map((b) => [b.id, b]));

  const rooms: DiscussionRoomView[] = discussions.map((d) => {
    const book = bookById.get(d.bookId);
    return {
      id: d.id,
      bookTitle: book?.title ?? '(삭제된 책)',
      personaKey: d.personaKey,
      topic: d.title ?? '대화',
      when: formatDateLabel(d.createdAt),
      turns: d.messageCount,
      coverColor: book?.coverColor ?? DEFAULT_COVER,
    };
  });

  const threads: Record<string, MessageView[]> = {};
  for (const d of discussions) threads[d.id] = toThread(d);

  const newChatBooks: NewChatBook[] = books
    .filter((b) => b.status === BookStatus.READING || b.status === BookStatus.DONE)
    .map(toNewChatBook);

  return (
    <>
      <TopBar title="AI 독서토론" subtitle="책에 대해 천천히 묻고 답해보세요" showSearch={false} />
      <DiscussionWorkspace rooms={rooms} threads={threads} books={newChatBooks} />
    </>
  );
}

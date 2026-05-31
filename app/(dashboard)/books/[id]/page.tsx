import { TopBar } from '@/components/layout/top-bar';
import { BookDetail, type BookDetailView } from '@/components/feature/book-detail/book-detail';

// 책 상세 샘플 — 추후 GetBookDetailQuery(책 메타 + 한 줄 + 토론방 + 세션)로 대체.
const SAMPLE_BOOKS: Record<string, BookDetailView> = {
  b1: {
    id: 'b1',
    title: '일곱 해의 마지막',
    author: '김연수',
    publisherLine: '문학과지성사 · 2020',
    eyebrow: '한국 소설 · 장편',
    coverColor: 'var(--terra-600)',
    status: 'reading',
    format: '종이책',
    startedAt: '11월 6일',
    bookmark: 142,
    quotesCount: 14,
    tags: ['#문장수집', '#위로'],
    authorDeceased: false,
    intro:
      '시인 백석을 모티프로 한 김연수의 장편소설. 한 시인의 침묵과 한 사람의 기다림, 그리고 그 사이에 흐르는 시대의 폭력. 마음에 닻을 내리는 문장들이 천천히 쌓여가는 이야기.',
    highlights: [
      {
        id: 'h1',
        content: '아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.',
        emphasis: '어떤 문장이 자신의 것인지',
        author: '김연수',
        book: '일곱 해의 마지막',
        page: 'p.42',
      },
      {
        id: 'h2',
        content: '침묵도 하나의 문장이었다. 다만 아직 읽는 법을 배우지 못했을 뿐이다.',
        author: '김연수',
        book: '일곱 해의 마지막',
        page: 'p.118',
      },
    ],
    rooms: [
      {
        id: 'r1',
        personaKey: 'critic',
        topic: '4장 · 빛나는 것들에 대하여',
        when: '방금',
        turns: 14,
        active: true,
      },
      { id: 'r2', personaKey: 'friend', topic: '백석에 대한 잡담', when: '어제', turns: 8 },
    ],
    recentSessions: [
      { date: '11월 18일 · 화', activity: '한 줄 1개 담김', range: 'p.220 → p.234' },
      { date: '11월 17일 · 월', activity: 'AI 토론 1회', range: '—' },
      { date: '11월 15일 · 토', activity: '한 줄 3개 담김', range: 'p.198 → p.220' },
    ],
  },
  b4: {
    id: 'b4',
    title: '데미안',
    author: '헤르만 헤세',
    publisherLine: '민음사 · 1919',
    eyebrow: '독일 소설 · 성장',
    coverColor: 'var(--clay-500)',
    status: 'done',
    format: '전자책',
    startedAt: '5월 2일',
    finishedAt: '5월 20일',
    sessions: 9,
    quotesCount: 6,
    rating: 4.5,
    review: '알을 깨고 나오는 일에 대한 가장 다정한 안내서.',
    tags: ['#성장', '#고전'],
    authorDeceased: true,
    intro:
      '새는 알에서 나오려고 투쟁한다. 싱클레어가 데미안을 만나 자기 자신에게 이르는 길을 더듬어 가는 이야기. 한 세대의 통과의례가 된 헤세의 대표작.',
    highlights: [
      {
        id: 'h1',
        content:
          '새는 알에서 나오려고 투쟁한다. 알은 세계다. 태어나려는 자는 한 세계를 깨뜨려야 한다.',
        emphasis: '한 세계를 깨뜨려야 한다',
        author: '헤르만 헤세',
        book: '데미안',
        page: 'p.123',
      },
    ],
    rooms: [
      {
        id: 'r1',
        personaKey: 'author',
        topic: '완독 후 회고',
        when: '5월 20일',
        turns: 11,
        active: true,
      },
    ],
    recentSessions: [
      { date: '5월 20일 · 화', activity: 'AI 토론 1회', range: '완독' },
      { date: '5월 18일 · 일', activity: '한 줄 2개 담김', range: 'p.96 → p.123' },
    ],
  },
};

function getBookDetail(id: string): BookDetailView {
  // 알 수 없는 id 는 읽는 중 샘플로 폴백(데모 — 모든 책 카드가 동작하도록)
  return SAMPLE_BOOKS[id] ?? { ...SAMPLE_BOOKS.b1!, id };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBookDetail(id);

  return (
    <>
      <TopBar title={book.title} subtitle={book.author} showSearch={false} />
      <BookDetail book={book} />
    </>
  );
}

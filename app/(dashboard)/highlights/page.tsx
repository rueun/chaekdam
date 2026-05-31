import Link from 'next/link';
import { TopBar } from '@/components/layout/top-bar';
import { HighlightCard, type HighlightView } from '@/components/feature/highlight/highlight-card';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/lib/router/routes';

// 샘플 한 줄 모음 — 추후 Highlight 조회 유스케이스로 대체
const HIGHLIGHTS: HighlightView[] = [
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
    content: '나는 책을 덮고서야 비로소 그 문장의 무게를 알았다. 읽는 동안에는 너무 가벼웠다.',
    emphasis: '읽는 동안에는 너무 가벼웠다.',
    author: '김애란',
    book: '바깥은 여름',
    page: 'p.94',
  },
  {
    id: 'h3',
    content: '기억은 우리가 떠나온 곳이 아니라, 우리가 끝내 돌아가지 못한 곳에 머문다.',
    author: '최은영',
    book: '쇼코의 미소',
    page: 'p.61',
  },
  {
    id: 'h4',
    content: '여행은 떠나는 일이 아니라, 익숙한 것과 잠시 거리를 두는 연습이다.',
    emphasis: '익숙한 것과 잠시 거리를 두는 연습',
    author: '김영하',
    book: '여행의 이유',
    page: 'p.118',
  },
  {
    id: 'h5',
    content: '슬픔을 공부한다는 것은, 슬픔 앞에서 끝내 도망치지 않는 법을 배우는 것이다.',
    author: '신형철',
    book: '슬픔을 공부하는 슬픔',
    page: 'p.7',
  },
  {
    id: 'h6',
    content: '말하지 못한 안부는 사라지지 않고, 다른 계절의 문장이 되어 돌아온다.',
    emphasis: '다른 계절의 문장이 되어 돌아온다',
    author: '이현우',
    book: '아주 사적인 독서',
    page: 'p.203',
  },
];

export default function HighlightsPage() {
  return (
    <>
      <TopBar
        title="밑줄 모음"
        subtitle={`${HIGHLIGHTS.length}개의 문장 · 이번 달 18개 추가`}
        action={
          <Link href={ROUTES.NOTES.LIST()} className="btn btn-primary">
            <Icon name="pen-line" size={16} />한 줄 담기
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        {HIGHLIGHTS.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>
    </>
  );
}

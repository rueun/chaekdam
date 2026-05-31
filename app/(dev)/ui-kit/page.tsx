import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Tag } from '@/components/ui/tag';
import { StatusBadge } from '@/components/ui/status-badge';
import { BookCard, type BookCardView } from '@/components/feature/library/book-card';

/**
 * 디자인시스템 쇼케이스 (개발 전용).
 *
 * 프리미티브를 그룹 단위로 누적 전시해 시각 확인용으로 쓴다. 라우트: /ui-kit
 */

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-1 text-[22px] font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
        {title}
      </h2>
      {note ? (
        <p className="mb-4 text-[13px] text-[var(--fg-2)]">{note}</p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 font-mono text-[11px] tracking-wide text-[var(--fg-3)] uppercase">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const SAMPLE_BOOKS: BookCardView[] = [
  {
    title: '일곱 해의 마지막',
    author: '김연수',
    status: 'reading',
    coverColor: 'var(--terra-600)',
    bookmark: 142,
    lastActive: '2일 전',
  },
  {
    title: '데미안',
    author: '헤르만 헤세',
    status: 'done',
    coverColor: 'var(--clay-500)',
    rating: 4.5,
    finishedAt: '5월 20일',
  },
  {
    title: '아주 사적인 독서',
    author: '이현우',
    status: 'wish',
    coverColor: 'var(--talk-500)',
    startedAt: '5월 28일',
  },
  {
    title: '바깥은 여름',
    author: '김애란',
    status: 'paused',
    coverColor: 'var(--ink-700)',
    startedAt: '4월 10일',
  },
];

export default function UiKitPage() {
  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="mb-2 text-[30px] font-bold tracking-[-0.03em] text-[var(--ink-900)]">
        UI Kit
      </h1>
      <p className="mb-10 text-[14px] text-[var(--fg-2)]">
        디자인시스템 프리미티브 쇼케이스 — 그룹 단위로 누적됩니다.
      </p>

      {/* ───── G2 — 표시·상태 ───── */}
      <Section title="G2 · Badge" note="작은 상태 핍 — new/ai/done">
        <Row label="variant">
          <Badge variant="new">NEW</Badge>
          <Badge variant="ai">AI</Badge>
          <Badge variant="done">완독</Badge>
        </Row>
      </Section>

      <Section title="G2 · Chip" note="필터/선택 필 — default/soft × md/sm × active">
        <Row label="default — md">
          <Chip>소설</Chip>
          <Chip active>에세이</Chip>
          <Chip>시</Chip>
        </Row>
        <Row label="soft / sm">
          <Chip variant="soft">추천</Chip>
          <Chip size="sm">소설</Chip>
          <Chip size="sm" active>
            에세이
          </Chip>
        </Row>
      </Section>

      <Section title="G2 · Tag" note="콘텐츠 인라인 태그 — 비인터랙티브">
        <Row label="tag">
          <Tag>#소설</Tag>
          <Tag>#독서기록</Tag>
          <Tag>#한_줄</Tag>
        </Row>
      </Section>

      {/* ───── G1 — 액션·표면 ───── */}
      <Section
        title="G1 · Button"
        note="variant(primary/secondary/ghost/danger) × size(md/sm) × 상태"
      >
        <Row label="variant — md">
          <Button variant="primary">시작하기</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="ghost">더보기</Button>
          <Button variant="danger">삭제</Button>
        </Row>
        <Row label="size — sm">
          <Button variant="primary" size="sm">
            시작하기
          </Button>
          <Button variant="secondary" size="sm">
            취소
          </Button>
          <Button variant="ghost" size="sm">
            더보기
          </Button>
        </Row>
        <Row label="state — disabled">
          <Button variant="primary" disabled>
            시작하기
          </Button>
          <Button variant="secondary" disabled>
            취소
          </Button>
        </Row>
        <Row label="iconOnly">
          <Button variant="secondary" iconOnly aria-label="설정">
            ⚙
          </Button>
          <Button variant="ghost" iconOnly size="sm" aria-label="더보기">
            ⋯
          </Button>
        </Row>
      </Section>

      <Section title="G1 · Card" note="plain=크림 채움 · elevated=흰 표면+그림자">
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <div className="mb-1 text-[15px] font-semibold text-[var(--ink-900)]">plain</div>
            <p className="text-[14px] leading-[1.55] text-[var(--fg-2)]">
              크림 표면 채움. 기본 카드.
            </p>
          </Card>
          <Card variant="elevated">
            <div className="mb-1 text-[15px] font-semibold text-[var(--ink-900)]">elevated</div>
            <p className="text-[14px] leading-[1.55] text-[var(--fg-2)]">
              흰 표면 + 따뜻한 그림자.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="G1 · Progress" note="0–100 클램프">
        <div className="flex max-w-md flex-col gap-4">
          <Progress value={25} label="25%" />
          <Progress value={60} label="60%" />
          <Progress value={100} label="100%" />
        </div>
      </Section>

      {/* ───── G0 — 토큰·상태·책 카드 ───── */}
      <Section
        title="G0 · StatusBadge"
        note="reading/done/wish/paused × size(md/sm) × variant(soft/solid)"
      >
        <Row label="soft — md">
          <StatusBadge status="reading" />
          <StatusBadge status="done" />
          <StatusBadge status="wish" />
          <StatusBadge status="paused" />
        </Row>
        <Row label="soft — sm">
          <StatusBadge status="reading" size="sm" />
          <StatusBadge status="done" size="sm" />
          <StatusBadge status="wish" size="sm" />
          <StatusBadge status="paused" size="sm" />
        </Row>
        <Row label="solid">
          <StatusBadge status="reading" variant="solid" />
          <StatusBadge status="done" variant="solid" />
          <StatusBadge status="wish" variant="solid" />
          <StatusBadge status="paused" variant="solid" />
        </Row>
      </Section>

      <Section title="G0 · BookCard" note="상태별 보조 메타 — bookMetaLine">
        <div className="grid grid-cols-4 gap-[22px]">
          {SAMPLE_BOOKS.map((book) => (
            <BookCard key={book.title} book={book} />
          ))}
        </div>
      </Section>
    </main>
  );
}

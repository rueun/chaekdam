import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Tag } from '@/components/ui/tag';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Radio } from '@/components/ui/radio';
import { Toggle } from '@/components/ui/toggle';
import { Segmented } from '@/components/ui/segmented';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { SearchDemo } from './search-demo';
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

      {/* ───── 아이콘 시스템 (lucide) ───── */}
      <Section title="Icon" note="lucide-react · currentColor 상속 · name 기반(사용 아이콘만 등록)">
        <div className="flex flex-wrap items-center gap-5 text-[var(--ink-700)]">
          <Icon name="search" aria-label="검색" />
          <Icon name="plus" aria-label="추가" />
          <Icon name="check" aria-label="확인" />
          <Icon name="x" aria-label="닫기" />
          <Icon name="settings" aria-label="설정" />
          <Icon name="chevron-down" aria-label="펼치기" />
          <Icon name="more-horizontal" aria-label="더보기" />
          <span className="text-[var(--accent)]">
            <Icon name="check" size={28} aria-label="큰 확인(색 상속)" />
          </span>
        </div>
      </Section>

      {/* ───── G4 — 선택 컨트롤 ───── */}
      <Section title="G4 · Checkbox" note="기본 / 체크 / indeterminate / disabled">
        <div className="flex flex-col gap-2">
          <Checkbox defaultChecked>소설</Checkbox>
          <Checkbox>에세이</Checkbox>
          <Checkbox indeterminate>부분 선택</Checkbox>
          <Checkbox disabled>비활성</Checkbox>
        </div>
      </Section>

      <Section title="G4 · Radio" note="단일 선택 그룹(name)">
        <div className="flex flex-col gap-2">
          <Radio name="genre" defaultChecked>
            전체
          </Radio>
          <Radio name="genre">소설</Radio>
          <Radio name="genre">시</Radio>
          <Radio name="genre" disabled>
            비활성
          </Radio>
        </div>
      </Section>

      <Section title="G4 · Toggle" note="스위치 — md / lg / disabled">
        <Row label="md">
          <Toggle defaultChecked aria-label="알림 켜기" />
          <Toggle aria-label="알림 끄기" />
        </Row>
        <Row label="lg">
          <Toggle size="lg" defaultChecked aria-label="큰 스위치 켜기" />
          <Toggle size="lg" disabled aria-label="비활성 스위치" />
        </Row>
      </Section>

      <Section title="G4 · Segmented" note="단일 선택(radiogroup) — ← → 키 이동">
        <Segmented
          aria-label="보기 필터"
          defaultValue="all"
          options={[
            { value: 'all', label: '전체' },
            { value: 'reading', label: '읽는 중' },
            { value: 'done', label: '완독' },
          ]}
        />
      </Section>

      {/* ───── G3 — 텍스트 입력 ───── */}
      <Section title="G3 · Input" note="기본 / 값 / disabled / error">
        <div className="flex max-w-md flex-col gap-3">
          <Input placeholder="제목을 입력하세요" />
          <Input defaultValue="데미안" />
          <Input placeholder="비활성" disabled />
          <Input defaultValue="잘못된 값" error />
        </div>
      </Section>

      <Section title="G3 · Search" note="돋보기 아이콘 + 지우기(가운데는 라이브 동작)">
        <div className="flex max-w-md flex-col gap-3">
          <SearchInput placeholder="책 검색" />
          <SearchDemo />
          <SearchDemo pill />
        </div>
      </Section>

      <Section
        title="G3 · Select"
        note="커스텀 드롭다운(.sel-menu) — 클릭/↑↓·Enter·Esc, 선택 항목 체크"
      >
        <div className="flex flex-wrap gap-3">
          <Select
            aria-label="책 상태"
            defaultValue="reading"
            options={[
              { value: 'reading', label: '읽는 중' },
              { value: 'done', label: '완독' },
              { value: 'wish', label: '읽고 싶은' },
              { value: 'paused', label: '쉬는 중' },
            ]}
          />
          <Select aria-label="비활성" disabled placeholder="비활성" options={[]} />
        </div>
      </Section>

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
          <Button variant="secondary" iconOnly aria-label="닫기">
            <Icon name="x" />
          </Button>
          <Button variant="ghost" iconOnly size="sm" aria-label="더보기">
            <Icon name="more-horizontal" size={16} />
          </Button>
        </Row>
        <Row label="아이콘 + 라벨">
          <Button variant="primary">
            <Icon name="plus" size={16} />책 추가
          </Button>
          <Button variant="secondary">
            <Icon name="search" size={16} />
            검색
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
            <BookCard key={`${book.title}-${book.author}`} book={book} />
          ))}
        </div>
      </Section>
    </main>
  );
}

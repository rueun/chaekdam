interface ReaderPaneProps {
  bookTitle: string;
  /** 오늘 날짜 라벨 (예: '11월 18일') */
  dateLabel: string;
}

/**
 * 리더 본문 — 담은 '한 줄'(밑줄)이 포함된 읽기 지면. (데모: 정적 콘텐츠.)
 * 사용자 밑줄(green underline)과 AI 인용 하이라이트(yellow)를 구분 표시.
 */
export function ReaderPane({ bookTitle, dateLabel }: ReaderPaneProps) {
  return (
    <article className="border-divider bg-bg-elevated text-ink-800 rounded-lg border px-14 py-11 font-serif text-[18px] leading-[1.9] tracking-[-0.015em]">
      <div className="text-accent mb-2 text-[11px] font-bold tracking-[0.1em] uppercase">
        오늘 {dateLabel} · {bookTitle}
      </div>
      <h3 className="text-ink-900 mb-[22px] font-serif text-[28px] font-semibold tracking-[-0.03em]">
        겨울의 끝에서
      </h3>
      <p className="mb-4">
        기행은 백석의 시를 다시 외우기 시작했다. 그 겨울의 끝자락, 입김이 길게 늘어지는 새벽에 그는
        마치 누군가에게 들려주려는 것처럼 조용히 입을 움직였다.
      </p>
      <p className="mb-4">
        <mark className="mark-underline">
          아주 천천히 책장을 넘기는 사람만이 어떤 문장이 자신의 것인지 알아본다.
        </mark>{' '}
        기행은 그 문장을 자기 것으로 만들고 싶었지만, 그 문장은 이미 너무 오래 다른 사람의 것이었다.
      </p>
      <p className="mb-4">
        그는 한참을 그렇게 앉아 있었다.{' '}
        <mark className="mark-highlight">조용한 장면이 크게 들렸다.</mark> 멀리서 기차 소리가
        들렸고, 그 소리는 마치 그가 외우던 시의 운율과 닮아 있었다.
      </p>
    </article>
  );
}

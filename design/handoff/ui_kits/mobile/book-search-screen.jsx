// Chaekdam · Mobile book search screen
// Same Naver Books shape as the web BookSearchDialog (see
// ui_kits/web/book-search.jsx for the API contract).

const NAVER_MOCK_M = [
  {
    title: '일곱 해의 <b>마지막</b>',
    author: '김연수',
    publisher: '문학과지성사',
    pubdate: '20200520',
    isbn: '9788932036779',
    bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
  },
  {
    title: '<b>작별</b>인사',
    author: '김영하',
    publisher: '복복서가',
    pubdate: '20220502',
    isbn: '9791191114836',
    bg: 'linear-gradient(155deg,#1F2A1B,#4A6741)',
  },
  {
    title: '바깥은 여름',
    author: '김애란',
    publisher: '문학동네',
    pubdate: '20170629',
    isbn: '9788954647014',
    bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
  },
  {
    title: '쇼코의 미소',
    author: '최은영',
    publisher: '문학동네',
    pubdate: '20160714',
    isbn: '9788954641340',
    bg: 'linear-gradient(155deg,#6F4E7C,#3E2B47)',
  },
  {
    title: '여행의 이유',
    author: '김영하',
    publisher: '문학동네',
    pubdate: '20190417',
    isbn: '9788954656016',
    bg: 'linear-gradient(155deg,#D9963D,#86571B)',
  },
];

function stripBHl(s) {
  return (s || '').replace(/<\/?b>/g, '');
}
function pubYr(p) {
  return p && p.length >= 4 ? p.slice(0, 4) : '';
}

function BookSearchScreen({ onBack }) {
  const [q, setQ] = React.useState('');
  const [picked, setPicked] = React.useState(null);
  const [added, setAdded] = React.useState({});
  const [state, setState] = React.useState('idle');
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setState('idle');
      return;
    }
    setState('loading');
    const t = setTimeout(() => {
      const lc = q.toLowerCase();
      const hits = NAVER_MOCK_M.filter(
        (b) =>
          stripBHl(b.title).toLowerCase().includes(lc) ||
          b.author.toLowerCase().includes(lc) ||
          b.isbn.includes(lc),
      );
      setItems(hits);
      setState(hits.length ? 'done' : 'empty');
    }, 360);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div data-screen-label="11 Add Book" className="m-bksearch">
      <div className="m-top">
        <button style={{ background: 'transparent', padding: 6 }} onClick={onBack}>
          {McIc.back}
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>책 추가</div>
        <div style={{ width: 30 }} />
      </div>

      <div className="m-bksearch-bar">
        <div className="search">
          <input
            placeholder="책 제목 · 작가 · ISBN 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          {q && (
            <button className="clear" onClick={() => setQ('')}>
              ×
            </button>
          )}
        </div>
        <div className="m-bksearch-source">전체 도서 검색</div>
      </div>

      {state === 'idle' && (
        <div className="m-bksearch-empty">
          <div className="t">담고 싶은 책을 찾아주세요</div>
          <div className="s">제목 · 작가 · ISBN으로 검색할 수 있어요</div>
          <div className="m-bksearch-recent">
            {['김연수', '에세이', '한국 문학', '시'].map((r) => (
              <button key={r} className="chip chip-sm" onClick={() => setQ(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="m-bksearch-empty">
          <div className="bksearch-loader" />
          <div className="t">책을 찾고 있어요…</div>
        </div>
      )}

      {state === 'empty' && (
        <div className="m-bksearch-empty">
          <div className="t">"{q}"에 대한 결과가 없어요</div>
          <div className="s">제목의 일부나 작가 이름으로 다시 검색해 보세요</div>
        </div>
      )}

      {state === 'done' && (
        <>
          <div className="m-bksearch-count">
            검색 결과 <b>{items.length}</b>권
          </div>
          <div className="m-cells" style={{ marginTop: 4 }}>
            {items.map((b) => {
              const isAdded = !!added[b.isbn];
              return (
                <div
                  key={b.isbn}
                  className={'m-cell m-bksearch-row ' + (isAdded ? 'is-added' : '')}
                  onClick={() => !isAdded && setPicked(b)}
                  style={{ cursor: isAdded ? 'default' : 'pointer' }}
                >
                  <div className="m-cell-l">
                    <div className="m-cell-thumb" style={{ background: b.bg }}>
                      {stripBHl(b.title).charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="m-cell-t"
                        dangerouslySetInnerHTML={{
                          __html: b.title
                            .replace(/<b>/g, '<mark class="hl">')
                            .replace(/<\/b>/g, '</mark>'),
                        }}
                      />
                      <div className="m-cell-s">
                        {b.author} · {b.publisher} · {pubYr(b.pubdate)}
                      </div>
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="m-bksearch-added">담김</span>
                  ) : (
                    <span className="m-bksearch-plus">＋</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="m-bksearch-hint">
        원하는 책이 없다면 <a>직접 등록</a>할 수 있어요.
      </div>

      {/* Bottom sheet to pick a shelf */}
      {picked && (
        <div className="m-sheet-scrim" onClick={() => setPicked(null)}>
          <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="m-sheet-grab" />
            <div className="m-sheet-book">
              <div
                className="m-cell-thumb"
                style={{ background: picked.bg, width: 56, height: 80 }}
              >
                {stripBHl(picked.title).charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="m-sheet-tt">{stripBHl(picked.title)}</div>
                <div className="m-sheet-au">{picked.author}</div>
                <div className="m-sheet-pub">
                  {picked.publisher} · {pubYr(picked.pubdate)}
                </div>
              </div>
            </div>
            <div className="m-sheet-section">어디에 담을까요?</div>
            {[
              ['reading', '읽는 중'],
              ['wish', '읽고 싶은'],
              ['done', '완독'],
            ].map(([k, l]) => (
              <button
                key={k}
                className="m-sheet-opt"
                onClick={() => {
                  setAdded((prev) => ({ ...prev, [picked.isbn]: k }));
                  setPicked(null);
                }}
              >
                {l}
              </button>
            ))}
            <button className="m-sheet-cancel" onClick={() => setPicked(null)}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BookSearchScreen });

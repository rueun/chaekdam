// Chaekdam · Book search dialog (web)
// Wires up to Naver Books search API. The mocked data here has the same
// shape Naver returns — drop in a real API call (via your backend proxy)
// and the UI will work unchanged.
//
//   GET https://openapi.naver.com/v1/search/book.json?query=...
//   Headers: X-Naver-Client-Id, X-Naver-Client-Secret
//   Response: { items: [{ title, link, image, author, publisher,
//                         pubdate, isbn, description, ... }, ...] }
//
// Note: Naver returns title with <b>...</b> highlight tags around match
// terms and HTML-entity-encoded chars. We render them safely below.

const { useState: _bsUseState, useEffect: _bsUseEffect, useRef: _bsUseRef } = React;

// Mocked Naver-shaped results. Image is null → cover falls back to
// gradient placeholder, mirroring the rest of the kit.
const NAVER_MOCK = [
  {
    title: '일곱 해의 <b>마지막</b>',
    author: '김연수',
    publisher: '문학과지성사',
    pubdate: '20200520',
    isbn: '9788932036779',
    image: null,
    description: '시인 백석을 모티프로 한 김연수의 장편소설. 한 시인의 침묵과 한 사람의 기다림.',
    bg: 'linear-gradient(155deg,#3F6750,#1F4030)',
  },
  {
    title: '<b>작별</b>인사',
    author: '김영하',
    publisher: '복복서가',
    pubdate: '20220502',
    isbn: '9791191114836',
    image: null,
    description: '기계와 인간의 경계가 흐릿해진 가까운 미래, 한 소년의 마지막 인사.',
    bg: 'linear-gradient(155deg,#1F2A1B,#4A6741)',
  },
  {
    title: '바깥은 여름',
    author: '김애란',
    publisher: '문학동네',
    pubdate: '20170629',
    isbn: '9788954647014',
    image: null,
    description: '상실과 회복, 그리고 그 사이에 머무는 풍경들.',
    bg: 'linear-gradient(155deg,#6E94A3,#3F5E6B)',
  },
  {
    title: '쇼코의 미소',
    author: '최은영',
    publisher: '문학동네',
    pubdate: '20160714',
    isbn: '9788954641340',
    image: null,
    description: '평범한 인물들이 서로에게 닿고 떠나는 짧은 이야기들.',
    bg: 'linear-gradient(155deg,#6F4E7C,#3E2B47)',
  },
  {
    title: '여행의 이유',
    author: '김영하',
    publisher: '문학동네',
    pubdate: '20190417',
    isbn: '9788954656016',
    image: null,
    description: '여행하지 못하는 시기에 더 자주 펼쳐 보는 여행 에세이.',
    bg: 'linear-gradient(155deg,#D9963D,#86571B)',
  },
];

// Strip Naver's <b> highlight tags safely.
function stripTags(s) {
  return (s || '').replace(/<\/?b>/g, '');
}

function formatPubDate(pd) {
  if (!pd || pd.length < 4) return '';
  return pd.slice(0, 4); // YYYYMMDD → YYYY
}

// Higher-level fetch hook. In production this points at *your* backend
// (which holds the Naver client secret), not directly at api.naver.com.
function useBookSearch(query) {
  const [items, setItems] = _bsUseState([]);
  const [state, setState] = _bsUseState('idle'); // 'idle' | 'loading' | 'done' | 'empty' | 'error'

  _bsUseEffect(() => {
    if (!query || !query.trim()) {
      setItems([]);
      setState('idle');
      return;
    }
    setState('loading');
    const t = setTimeout(() => {
      // Pretend the network is slow. Filter mock by query.
      const q = query.toLowerCase();
      const hits = NAVER_MOCK.filter(
        (b) =>
          stripTags(b.title).toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.publisher.toLowerCase().includes(q) ||
          b.isbn.includes(q),
      );
      setItems(hits);
      setState(hits.length ? 'done' : 'empty');
    }, 380);
    return () => clearTimeout(t);
  }, [query]);

  return { items, state };
}

// ─────────────────────────────────────────────
//  BookSearchDialog — primary entry from "책 추가"
// ─────────────────────────────────────────────
function BookSearchDialog({ open, onClose }) {
  const [q, setQ] = _bsUseState('');
  const [shelf, setShelf] = _bsUseState({}); // isbn → shelf
  const [added, setAdded] = _bsUseState({}); // isbn → boolean
  const inputRef = _bsUseRef(null);
  const { items, state } = useBookSearch(q);

  _bsUseEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
      lucide.createIcons();
    } else {
      setQ('');
      setShelf({});
      setAdded({});
    }
  }, [open]);

  // Re-run icon swap whenever search state changes (new result rows have
  // fresh <i data-lucide="..."> elements that need replacing).
  _bsUseEffect(() => {
    if (open && window.lucide) lucide.createIcons();
  }, [open, state, items, added]);

  if (!open) return null;

  const setShelfFor = (isbn, v) => setShelf((prev) => ({ ...prev, [isbn]: v }));
  const add = (isbn) => setAdded((prev) => ({ ...prev, [isbn]: true }));

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal bksearch" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">책 추가</div>
            <h2 className="modal-title">어떤 책을 담을까요?</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
            <Icon name="x" className="icon" />
          </button>
        </div>

        <div className="bksearch-bar">
          <div className="search">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="책 제목 · 작가 · ISBN으로 검색"
            />
            {q && (
              <button className="clear" onClick={() => setQ('')} title="지우기">
                ×
              </button>
            )}
          </div>
          <span className="bksearch-source">
            <Icon name="info" className="icon icon-sm" />
            전체 도서 검색
          </span>
        </div>

        <div className="bksearch-body">
          {state === 'idle' && (
            <div className="bksearch-empty">
              <Icon
                name="book-open"
                className="icon"
                style={{ width: 28, height: 28, color: 'var(--ink-500)' }}
              />
              <div className="t">담고 싶은 책을 찾아주세요</div>
              <div className="s">최근에 읽고 싶었던 책이나 친구가 권한 책의 제목을 적어보세요</div>
              <div className="bksearch-recent">
                {['김연수', '에세이', 'ISBN 9788932036779'].map((rec) => (
                  <button
                    key={rec}
                    className="chip chip-sm"
                    onClick={() => setQ(rec.replace(/^ISBN\s+/, ''))}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state === 'loading' && (
            <div className="bksearch-empty">
              <div className="bksearch-loader" aria-label="검색 중" />
              <div className="t">책을 찾고 있어요…</div>
            </div>
          )}

          {state === 'empty' && (
            <div className="bksearch-empty">
              <Icon
                name="search-x"
                className="icon"
                style={{ width: 28, height: 28, color: 'var(--ink-500)' }}
              />
              <div className="t">"{q}"에 대한 결과가 없어요</div>
              <div className="s">제목의 일부나 작가 이름으로 다시 검색해 보세요</div>
            </div>
          )}

          {state === 'done' && (
            <>
              <div className="bksearch-count">
                검색 결과 <b>{items.length}</b>권
              </div>
              <ul className="bksearch-list">
                {items.map((b) => {
                  const isbn = b.isbn;
                  const isAdded = !!added[isbn];
                  const cur = shelf[isbn] || 'wish';
                  return (
                    <li className={'bksearch-row ' + (isAdded ? 'is-added' : '')} key={isbn}>
                      <div className="bksearch-cover" style={{ background: b.bg }}>
                        {b.image ? <img src={b.image} alt="" /> : stripTags(b.title).slice(0, 4)}
                      </div>
                      <div className="bksearch-info">
                        <div
                          className="tt"
                          dangerouslySetInnerHTML={{
                            __html: b.title
                              .replace(/<b>/g, '<mark class="hl">')
                              .replace(/<\/b>/g, '</mark>'),
                          }}
                        />
                        <div className="meta">
                          <b>{b.author}</b>
                          <span>· {b.publisher}</span>
                          <span>· {formatPubDate(b.pubdate)}</span>
                        </div>
                        <div className="desc">{b.description}</div>
                        <div className="isbn">ISBN {b.isbn}</div>
                      </div>
                      <div className="bksearch-actions">
                        {isAdded ? (
                          <div className="bksearch-added">
                            <Icon name="check" className="icon icon-sm" />
                            서재에 담겼어요
                          </div>
                        ) : (
                          <>
                            <select
                              className="sel"
                              value={cur}
                              onChange={(e) => setShelfFor(isbn, e.target.value)}
                              style={{ minWidth: 140 }}
                            >
                              <option value="reading">읽는 중</option>
                              <option value="wish">읽고 싶은</option>
                              <option value="done">완독</option>
                            </select>
                            <button className="btn btn-primary" onClick={() => add(isbn)}>
                              <Icon name="plus" className="icon icon-sm" />
                              담기
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="bksearch-foot">
          <span className="hint">
            <Icon name="info" className="icon icon-sm" />
            국내 출간 도서를 검색해요. 원하는 책이 없다면{' '}
            <a href="#" className="lnk">
              직접 등록
            </a>
            할 수 있어요.
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BookSearchDialog });

import { describe, it, expect } from 'vitest';
import { toBookSearchHit, toBookSearchHits } from './naver-book-mapper';

describe('naver-book-mapper', () => {
  it('<b> 태그·HTML 엔티티를 정리한다', () => {
    const hit = toBookSearchHit({
      title: '<b>데미안</b> &amp; 그 외',
      image: 'https://img/x.jpg',
      author: '헤르만 헤세',
      publisher: '민음사',
      pubdate: '20200115',
      isbn: '9788937460775',
      description: '<b>새</b>는 알에서 &quot;투쟁&quot;한다',
    });
    expect(hit.title).toBe('데미안 & 그 외');
    expect(hit.description).toBe('새는 알에서 "투쟁"한다');
  });

  it('13자리 ISBN 을 우선 선택한다', () => {
    expect(
      toBookSearchHit({
        title: 'x',
        image: '',
        author: '',
        publisher: '',
        pubdate: '',
        isbn: '8937460777 9788937460775',
        description: '',
      }).isbn,
    ).toBe('9788937460775');
  });

  it('pubdate 에서 연도만 뽑는다', () => {
    expect(toBookSearchHit({ ...base(), pubdate: '20170615' }).publishedYear).toBe('2017');
    expect(toBookSearchHit({ ...base(), pubdate: '' }).publishedYear).toBe('');
  });

  it('다중 저자(^)를 쉼표로 잇는다', () => {
    expect(toBookSearchHit({ ...base(), author: '헤르만 헤세^전영애' }).author).toBe(
      '헤르만 헤세, 전영애',
    );
  });

  it('숫자 HTML 엔티티(&#39;)와 &nbsp; 를 디코드한다', () => {
    const hit = toBookSearchHit({ ...base(), description: 'don&#39;t&nbsp;stop' });
    expect(hit.description).toBe("don't stop");
  });

  it('ISBN 이 공백뿐이면 빈 문자열', () => {
    expect(toBookSearchHit({ ...base(), isbn: '   ' }).isbn).toBe('');
  });

  it('pubdate 가 4자리 미만이면 빈 연도', () => {
    expect(toBookSearchHit({ ...base(), pubdate: '202' }).publishedYear).toBe('');
  });

  it('items 가 없으면 빈 배열', () => {
    expect(toBookSearchHits({})).toEqual([]);
  });
});

function base() {
  return {
    title: 'x',
    image: '',
    author: '',
    publisher: '',
    pubdate: '',
    isbn: '',
    description: '',
  };
}

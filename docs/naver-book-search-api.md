# 네이버 책 검색 API (연동 규격)

출처: https://developers.naver.com/docs/serviceapi/search/book/book.md
구현: `lib/infrastructure/naver-books/` (`NaverBookSearcher`, `naver-book-mapper`)

## 요청

- **엔드포인트**: `GET https://openapi.naver.com/v1/search/book.json`
- **인증 헤더**(서버 전용):
  - `X-Naver-Client-Id: {NAVER_BOOK_CLIENT_ID}`
  - `X-Naver-Client-Secret: {NAVER_BOOK_CLIENT_SECRET}`
- **파라미터**:
  - `query`(필수): 검색어, URL 인코딩.
  - `display`(선택): 결과 개수, 기본 10, 최대 100. (본 앱은 20)
  - `start`(선택): 시작 위치, 기본 1, 최대 1000.
  - `sort`(선택): `sim`(정확도순, 기본) / `date`(출간일순).

키는 [네이버 개발자센터](https://developers.naver.com) 에서 애플리케이션 등록 후 발급.
서버 전용 — 클라이언트에 노출 금지(`searchBooks` Server Action 으로 프록시).

## 응답 (JSON)

최상위: `lastBuildDate`, `total`, `start`, `display`, `items[]`.

`items[]` 각 항목:

| 필드          | 의미                 | 비고                                                   |
| ------------- | -------------------- | ------------------------------------------------------ |
| `title`       | 제목                 | 검색어에 `<b>` 태그, HTML 엔티티(`&amp;` 등) 포함 가능 |
| `link`        | 네이버 도서 정보 URL |                                                        |
| `image`       | 표지 썸네일 URL      |                                                        |
| `author`      | 저자                 | 다중 저자는 `^` 로 구분                                |
| `discount`    | 판매가               | 없을 수 있음                                           |
| `publisher`   | 출판사               | `<b>`·엔티티 포함 가능                                 |
| `pubdate`     | 출간일               | `YYYYMMDD`                                             |
| `isbn`        | ISBN                 | `"<isbn10> <isbn13>"` 공백 구분일 수 있음              |
| `description` | 책 소개              | `<b>`·엔티티 포함 가능                                 |

## 매핑 규칙 (`naver-book-mapper.ts`)

- `title`/`author`/`publisher`/`description`: 태그 제거 + 흔한 HTML 엔티티 디코드 + 트림.
- `author`: `^` → `, ` (다중 저자).
- `isbn`: 13자리 토큰 우선, 없으면 첫 토큰.
- `pubdate` → `publishedYear`: 앞 4자리(YYYY), 형식 아니면 빈 문자열.
- 도메인 `BookSearchHit` 으로 변환(도메인 `Book` 엔티티 아님).

## 앱 적용 메모

- 표지는 실사 썸네일(`image`) 대신 **페이퍼 색 스파인**으로 표시(디자인 시스템). ISBN/제목 해시로 색 고정.
- 책장에 담을 때는 `title`·`author` 만 도메인 `Book` 으로 옮긴다(ISBN·출판사·이미지는 현재 Book 미보유 — ADR-016).

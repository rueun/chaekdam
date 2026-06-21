# Architecture Decision Records

## 철학

- **MVP 속도 최우선** — Vercel + Supabase 무료 티어로 빠른 검증
- **언제든 백엔드 분리 가능한 구조 보존** — 도메인·유스케이스가 프레임워크에 의존하지 않음
- **AI 통합 친화** — Claude API 의 vision · 스트리밍 · 프롬프트 캐싱을 자연스럽게 활용
- **외부 의존성 최소화** — 작동하는 최소 구현 우선, 검증 후 확장

---

### ADR-001: Next.js + Supabase 로 시작 (별도 백엔드 없음)

**결정**: Next.js (App Router) 에 Server Actions 로 백엔드 코드를 두고, Supabase 가 Auth · DB · Storage · 권한(RLS) 담당. Claude API 는 Server Action 내부에서 호출.

**이유**: 1인 / MVP 단계. 비즈니스 로직 복잡도 중간. Vercel + Supabase 무료 티어로 인프라 관리 거의 없이 빠른 검증 가능.

**트레이드오프**: 복잡한 도메인 로직이 늘면 Server Action 에 뭉치기 쉬움 (ADR-002 로 보완). Supabase RLS 는 별도 백엔드로 옮길 시 이전 비용 있음 (ADR-004 로 대비).

---

### ADR-002: Clean Architecture + Domain First

**결정**: 4계층 분리 — Domain / Application / Infrastructure / Presentation. 의존성 방향: 내부(Domain)는 외부(Service / Infra / Presentation)를 모름. 도메인 → Port → Application → Infrastructure → Presentation 순으로 개발.

**이유**: ADR-001 의 한계 보완 + 추후 백엔드 분리 가능성 보존. 도메인 로직이 프레임워크에 종속되지 않으면 80% 코드를 그대로 이식 가능.

**트레이드오프**: 폴더 간 점프가 늘어 단순 작업 비용 ↑. 1인 MVP 단계엔 약간 과해 보일 수 있으나 도메인 응집·이전 가능성을 위해 수용.

---

### ADR-003: `lib/domain/` 은 외부 의존 0

**결정**: `lib/domain/` 에서 `next/*`, `@supabase/*`, `@anthropic-ai/sdk`, `react`, ORM 클라이언트 등 import 금지. `architecture-guard` 서브 에이전트로 자동 검증 (`/arch-check` 명령).

**이유**: 도메인 코드가 프레임워크 / BaaS 에 의존하면 백엔드 분리 시 코드 손실. 순수 도메인은 표준 라이브러리만 사용해야 이식 가능.

**트레이드오프**: Supabase 자동 생성 타입을 도메인에서 직접 못 씀 → 매핑 코드 추가 필요. 단기 비용은 있으나 장기 이식성에 우선 가치.

---

### ADR-004: RLS + 도메인 Specification 이중 방어

**결정**: 권한 검증을 두 곳에서 표현 — Supabase RLS 정책(SQL, 1차 방어) + 도메인 Specification 객체(`lib/domain/**/specs/`).

**이유**: Supabase RLS 는 SQL 기반이라 별도 백엔드로 옮기면 그대로 사용 못 함. 도메인 스펙으로도 표현해두면 백엔드 분리 시 RLS 만 제거하고 도메인 스펙 유지 가능.

**트레이드오프**: 같은 권한 규칙을 두 곳에서 관리 — 중복. 다만 RLS 는 마지막 안전장치, Spec 은 도메인 의도 표현으로 역할 분리 가능.

---

### ADR-005: AI 호출은 Port 로 추상화

**결정**: 도메인은 `AiDiscussionPartner` Port (인터페이스) 에만 의존. `ClaudeAiDiscussionPartner` Adapter 가 Anthropic SDK 실호출을 담당.

**이유**: Claude API 에 도메인이 직접 의존하면 다른 LLM(GPT, Gemini 등)으로 교체 어려움. AI 모델은 빠르게 변하는 영역이라 추상화 가치 ↑.

**트레이드오프**: 추상 레이어 한 단계 추가 — 단순 호출에 코드가 늘어남. AI 변경이 실제로 발생하지 않을 수도 있으나 비용은 충분히 작음.

---

### ADR-006: 컴포넌트 디렉토리에 FSD 'feature' 슬라이싱 차용

**결정**: 도메인 / 유스케이스 / 인프라는 Clean Arch 수평 분리 유지. **컴포넌트만 기능별 응집**(수직 슬라이싱). `components/ui/` (재사용 primitives) + `components/feature/{book-search, note-capture, discussion-chat}/`.

**이유**: FSD(회사 코드 패턴)와 Clean Arch 가 패러다임 충돌하지만 각자 강점이 다름. 도메인은 백엔드 분리 가능성을 위해 수평. UI 는 단일 화면이 여러 도메인 데이터를 조합하므로 기능별 응집이 가독성 / 이동성에 유리.

**트레이드오프**: 두 패러다임 혼용으로 약간의 학습 곡선. 다만 영역이 명확히 분리(도메인=수평, UI=수직)되어 혼란 적음.

---

### ADR-007: 토론 모드 = 하이브리드 (책 메타 + 사용자 구절)

**결정**: 사용자 한 줄을 핵심 컨텍스트로 사용하면서, 책 메타데이터(제목·저자·장르·간단 요약·저자 스타일)를 시스템 프롬프트에 1회 주입하는 **하이브리드 모드**. 프롬프트 캐싱으로 토큰 효율 최대화. 외부 도서 메타는 **네이버 책 API**(제목·저자·출판사·ISBN·출간일) 응답을 기반으로 한다.

**이유**: 구절 한정 모드는 빈약(맥락 부족), 책 전체 주입은 비용 ↑ + 책 요약 외부 의존 ↑. 하이브리드가 비용·깊이 균형. 책 메타는 한 번 캐싱 후 재사용 가능.

**트레이드오프**: 책 메타데이터 수집·관리 필요 — 외부 도서 API 응답 외에 일부 큐레이션 (예: 저자 스타일) 추가 필요할 수 있음. 외부 API 의존 발생.

---

### ADR-008: 다중 사용자 확장 가능 구조 (MVP 는 1:1)

**결정**: MVP 는 1:1 토론 (사용자 ↔ AI). 도메인 모델은 처음부터 `Participant` 엔티티를 분리 — User 와 별개로 토론 참가자 개념을 두고 MVP 단계에서는 Participant 가 1명일 뿐. 추후 북클럽 도입 시 Participant 추가만으로 확장.

**이유**: "User = 토론 참가자" 동일 모델로 시작하면 나중에 다중 사용자 도입 시 도메인 변경 비용 큼. 미리 분리하면 확장 비용 거의 0.

**트레이드오프**: MVP 단계 약간 과한 추상화. 단, Participant 엔티티는 단순(ID + 사용자 참조 + Role) 이라 비용 작음.

---

### ADR-009: AI 페르소나 = 톤·관점 아키타입 4종 (작가 본인은 사망 작가 한정 포함)

**결정**: 페르소나를 **톤·관점 아키타입** 으로 정의 — 소크라테스(질문) / 비평가(분석) / 작가 본인(쓴 사람의 목소리) / 책 동무(같이 읽는 친구) 4종. 작가별 상세 큐레이션 파일은 만들지 않고 페르소나는 톤만 지정, 책 정보는 컨텍스트에서 활용. **작가 본인 페르소나는 사망 작가에 한해 활성화**(책마다 다름), 생존 작가는 금지. 대화방은 생성 시 페르소나가 고정된다.

**이유**:

- **AI의 자체 지식 활용** — 작가별 큐레이션 없이도 Claude 가 책 컨텍스트에서 톤을 풍부하게 생성
- **단순화** — 페르소나 폭발 방지, 시스템 프롬프트 관리 비용 ↓
- **저작권·인격권 리스크 통제** — 생존 작가를 제외하고 사망 작가로 한정해 차별화("작가 본인과 토론")는 살리면서 리스크는 낮춤

**트레이드오프**: 초기 계획(ADR 구버전)은 작가 페르소나를 V1에서 전면 제외했으나, 사망 작가 한정으로 범위를 좌혀 차별화 가치를 확보. "사망 여부" 판단을 위한 작가 메타(생·몰연도) 필요 — 도서 API 나 소규모 큐레이션으로 충당.

---

### ADR-010: 핵심 가치 = 정서·자기 표현 (메인) + 회고·저널링 (보조) — "한 줄 + 독서 기록" 으로 실현

**결정**: 메인 가치는 **"정서·자기 표현"** — 따뜻한 톤·공감 위주 UX. 보조 가치는 회고·저널링. 다만 저널링을 **별도의 자유 형식 회고 노트로 받지 않고**, 사용자가 이미 생성하는 아티팩트로 실현한다 — 담은 **한 줄(Highlight) 수집** + **독서 기록**(월 캘린더·연속일·세션·통계). `Reflection` 자유 노트 엔티티는 V1에서 들이지 않고, `Highlight` · `ReadingLog` 가 저널링의 도메인 핵심이 된다.

**이유**: AI 토론 시장에서 "학습" 영역은 ChatGPT 등으로 포화. "정서적 책 친구 + 개인 독서 저널" 은 비어있는 영역. 빈 회고 노트는 쓰기 부담이 크고 재방문 동기가 약한 반면, **"한 줄"은 사진 한 장으로 가볍게 쌓이고** 컬렉션·캤린더로 변해 재방문 동기가 된다.

**트레이드오프**: "토론 후 긴 회고" 라는 명시적 저널링 흐름은 포기. 단, 한 줄·토론·세션이 책 상세·기록에 자동 누적되므로 저널링 가치는 더 낮은 마찰로 유지. 메인(정서)에 무게를 실어 일관성 유지.

---

### ADR-011: 단일 라이트(페이퍼) 테마 + 딥 포레스트 그린 브랜드 (다크 모드 제외)

**결정**: 단일 **라이트(월 크림/페이퍼) 테마**만 지원. 다크 모드는 제공하지 않는다. 브랜드 포인트는 **딥 포레스트 그린 `#3F6750` 단일**, 중립은 웰 크림/잉크. 보조색은 의미별로만 — 세이지(완독)·클레이(완독/오늘)·톡 블루(AI)·하이라이트 옥로(밑줄). 폰트는 Pretendard 전용.

**이유**: PRD 초기엔 "다크모드 우선"이었으나, 종이책의 정서·따뜻함을 살리려면 크림/잉크 표면이 더 적합. 두 테마를 동시 유지하면 토큰·명도 대비·이미지 대비를 두 벪 관리해야 해 MVP 비용 ↑. 단일 테마 + 단일 포인트로 일관된 아이덴티티 확보.

**트레이드오프**: 야간 독서 사용자가 선호할 다크 모드 미지원. 향후 수요 검증 시 토큰 기반으로 재도입 가능하도록 색은 의미 토큰(`--bg`·`--fg`·`--accent` 등)으로 분리 유지.

---

### ADR-012: 독서 추적 도메인 (책장 상태 · 세션 · 독서 기록)

**결정**: 독서 행위를 추적하는 도메인을 명시적으로 둔다 — `BookStatus`(읽는 중/완독/읽고 싶은/쉬는 중 책장), `ReadingSession`(`분` 측정 — 리더 화면 체류 시간, 명시적 시작/일시정지/종료), `ReadingLog`(일자별 읽음 여부·연속일·통계). 위시리스트는 `BookStatus = wish`.

**이유**: 제품이 단순 토론 도구를 넘어 독서 습관을 기록·시각화하는 자산으로 확장(ADR-010의 저널링 실현). '분'은 종이책을 자동 계측할 수 없으므로 리더 화면 체류 시간으로 근사·명시 제어. 서재는 상태별 선반(shelf) 모델로 관리.

**트레이드오프**: 토론만 했던 초기 범위보다 도메인·UI 면적 ↑. 다만 재방문·리텐션 기여가 크고, 세션·로그는 단순 이벤트 적재라 도메인 복잡도 낮음.

---

### ADR-013: 외부 공유 포함, 인앱 소셜 피드는 제외

**결정**: 담은 한 줄·책을 외부로 **내보내는 공유**(링크·한 장 이미지·카카오톡·X·스레드·메일)는 제공. 그러나 인앱 소셜 피드·좋아요·팔로우·댓글은 두지 않는다. 공유는 단방향(아웃바운드)이며 공개 한 줄 페이지는 읽기 전용.

**이유**: PRD 초기엔 소셜 전체를 제외했으나, "한 줄"은 자연스레 공유하고 싶은 아티팩트(정서 가치 + 유기적 유입)— 내보내기만 열어도 저널링 제품의 정체성(개인 기록)을 해치지 않음. 반면 인앱 피드·좋아요는 SNS 성격으로 변질되어 정서·저널링 포지셔닝을 흐린다.

**트레이드오프**: 공유 시트·공개 한 줄 페이지·이미지 렌더 구현 필요. 다만 읽기 전용 공개 페이지·단방향 공유만이라 피드·팔로우 그래프·모더레이션 부담은 없음.

---

### ADR-014: 사용자 프로필은 Supabase auth user_metadata 에 보관 (별도 profiles 테이블 없음)

**결정**: 사용자 프로필(이름·한 줄 소개)을 별도 `profiles` 테이블 없이 Supabase 인증의 `user_metadata` 에 저장한다. 이름은 이미 가입 시 `user_metadata.name` 에 적재되며, 소개(`bio`)도 같은 곳에 둔다. 도메인 `User` 엔티티는 Infrastructure 어댑터(`toUser`)가 인증 사용자에서 매핑한다. 읽기는 `AuthSession.getCurrentUser()`, 쓰기는 `UserProfileRepository.updateProfile()`(`auth.updateUser`)로 한다.

**이유**: 현재 프로필 필드가 이름·소개 2개뿐이라 전용 테이블·트리거·RLS·마이그레이션은 과설계(YAGNI). 데이터가 이미 인증 컨텍스트에 있어 마이그레이션 0으로 실연동 가능. `auth.updateUser` 는 현재 세션 사용자에게만 적용돼 소유 범위가 자연히 보장된다.

**트레이드오프**: `user_metadata` 는 비정형(JSON)이라 타입·제약은 어댑터/스키마(zod)에서만 보장된다. 아바타 이미지·팔로우·공개 프로필 등 리치 필드나 RLS 기반 조인이 필요해지면 `profiles` 테이블로 전환한다(도메인 `User`·Port 는 유지, 어댑터만 교체).

---

### ADR-015: AI 토론 MVP — 페르소나 코드 상수 · 작가 본인 보류 · 비스트리밍 우선

**결정**: AI 독서토론 첫 구현 범위를 다음으로 한정한다. (1) 페르소나(시스템 프롬프트·톤)는 별도 테이블 없이 `lib/domain/persona`에 **코드 상수**로 둔다(`PersonaRepository`·`personas` 테이블 없음). (2) **작가 본인 페르소나는 보류** — MVP는 소크라테스/비평가/책동무 3종, author는 정의만 두고 `availableKeys()`에서 제외(Author 도메인·저작권 판정은 후속). (3) AI 응답은 **비스트리밍** 우선 — `AiDiscussionPartner.respond()`가 완성 텍스트 반환, 스트리밍은 같은 Port를 async iterable로 확장하는 후속. (4) `Discussion`은 **책+페르소나**로 고정하고 한 줄(`seedHighlightId`)은 선택 시드. 상세: [`specs/2026-06-14-ai-discussion-design.md`](./specs/2026-06-14-ai-discussion-design.md).

**이유**: 페르소나는 4개 고정 아키타입이고 시스템 프롬프트는 버전관리·리뷰 대상 산출물이라 코드가 적합(YAGNI, ADR-014와 동일 결). 작가 본인은 저작권 판정·작가 메타 파이프라인이 필요해 가치 대비 복잡도가 커 분리. 비스트리밍 우선은 전체 루프(시작→응답→이어가기)를 적은 복잡도로 먼저 검증하고 스트리밍을 안전하게 덧붙이기 위함. anchor는 새 대화 모달(책+페르소나) UI와 일치.

**트레이드오프**: 페르소나 프롬프트 수정에 배포 필요(런타임 편집 불가) — 정적 큐레이션이라 무방. 작가 본인 페르소나(ADR-009의 차별화 가치)는 V1에 빠지지만 Port·도메인 구조는 유지해 후속 추가가 어댑터·데이터 작업으로 한정된다. 스트리밍 부재로 첫 응답 체감 지연 — 후속 슬라이스에서 해소.

---

### ADR-016: 네이버 책 검색 — Server Action 프록시 · 표지는 색 스파인 · Book 미확장

**결정**: 도서 검색을 `BookSearcher` Port + `NaverBookSearcher` 어댑터로 구현한다(규격: [`naver-book-search-api.md`](./naver-book-search-api.md)). (1) 네이버 키는 **서버 전용**이고 `searchBooks` **Server Action 으로 프록시**한다(클라이언트 노출 없음). (2) 검색 결과 표지는 실사 썸네일(`image`) 대신 **페이퍼 색 스파인**으로 표시한다 — ISBN/제목 해시로 색을 고정. (3) 책장에 담을 때는 `title`·`author` 만 도메인 `Book` 으로 옮기고, **ISBN·출판사·표지 이미지는 Book 에 추가하지 않는다**(현행 유지).

**이유**: 키 보호·CORS 회피를 위해 서버 프록시가 필요(stack.md). 실사 표지는 따뜻한 페이퍼 톤·색 스파인 디자인(ADR-011)과 충돌하고 외부 이미지 도메인 설정·로딩 비용이 생겨, MVP 는 결정적 색 스파인으로 일관된 톤 유지. Book 에 ISBN/출판사/이미지를 더하려면 마이그레이션·중복 판정 정책이 필요해 가치 대비 과해 보류.

**트레이드오프**: 색 스파인은 책 식별성이 실사보다 낮다(후속에 표지 이미지 옵션 검토 가능). ISBN 미저장으로 같은 책 중복 담기가 가능(후속에 ISBN 기반 dedup 도입 시 Book 확장). Port·유스케이스는 그대로라 검색 제공자(Google Books 등) 교체는 어댑터만 바꾸면 된다.

**갱신(2026-06-14)**: 위 (2)·(3)의 "색 스파인·표지 미저장"을 뒤집어 **실제 표지 썸네일**을 도입했다. `books.cover_image_url` 컬럼 추가 + `Book.coverImageUrl`, 검색 시 담으면 썸네일 URL 저장, 검색 결과·서재·위시·홈·책 상세에서 `BookCover` 가 이미지를 보여주고 **없거나 로딩 실패 시 색 스파인으로 폴백**한다. 외부 호스트는 `next.config` `images.remotePatterns`(`*.pstatic.net`)로 제한. ISBN 기반 dedup 은 여전히 미도입(제목+저자 매칭 유지).

### ADR-017: AI 토론 응답 스트리밍 — Route Handler + ReadableStream (webhook 전용 규칙 완화)

**결정**: ADR-015 의 "비스트리밍 우선"을 뒤집어 토론 이어가기를 **토큰 단위 스트리밍**으로 전환한다. (1) `AiDiscussionPartner` Port 에 `respondStream(context): AsyncIterable<string>` 를 추가하고 `ClaudeAiDiscussionPartner` 가 Anthropic `messages.create({ stream: true })` 의 `text_delta` 를 yield 한다(SDK 는 어댑터에만 격리, ADR-005). (2) `ContinueDiscussionUseCase.executeStreaming` 가 델타를 흘려보내며 누적하고 **스트림 정상 종료 시에만** 사용자+AI 메시지를 한 트랜잭션으로 저장한다(중단·실패 시 미저장 → 재시도). (3) 전송은 **Route Handler `POST /api/discussions/[id]/stream`** 가 `ReadableStream` 으로 내보내고 클라이언트는 `fetch().body` 리더로 소비한다. 따라서 **"Route Handler 는 외부 webhook 전용"(stack.md) 규칙을 "스트리밍 응답도 허용"으로 완화**한다. 기존 비스트리밍 `continueDiscussion` Server Action 은 제거(유스케이스 `execute` 는 비스트리밍 계약·테스트로 유지).

**이유**: 비스트리밍은 응답이 수 초간 멈췄다 한 번에 떠 토론 UX 체감이 나쁘다. Server Action 은 토큰 단위 점진 응답을 표현하지 못하고, 의존성 없이 표준 패턴으로 구현하려면 Route Handler + `ReadableStream` 이 가장 단순하다(Vercel AI SDK 도입은 LLM 의존을 UI 가까이 끌어와 ADR-005 와 충돌해 보류). 컨텍스트 관리(방 단위 누적 + 매 턴 전체 재전송)는 그대로라 도메인·저장 모델 변경 없음.

**트레이드오프**: Route Handler 진입점이 하나 늘어 검증/인증을 Server Action 과 별도로 둔다(미들웨어가 `/api/*` 도 인증 게이트하고, 라우트도 자체 인증 게이트로 이중 방어). 스트림 중단 시 그 턴은 저장되지 않아 사용자가 다시 보내야 한다. (프롬프트 캐싱은 ADR-018 에서 도입.)

### ADR-018: AI 토론 프롬프트 캐싱 — 시스템 + 이력 prefix 증분 캐싱 (beta API)

**결정**: 매 턴 전체 대화 이력을 재전송하는 비용(턴 수에 비례)을 줄이기 위해 Anthropic **프롬프트 캐싱**을 도입한다. `ClaudeAiDiscussionPartner` 가 (1) 시스템 프롬프트 블록과 (2) **메시지 배열의 마지막 메시지**에 `cache_control: { type: 'ephemeral' }` 를 달아, "직전까지의 이력 prefix"를 캐싱한다 — 다음 턴엔 동일 prefix(이력은 append-only)가 재현돼 캐시 히트(증분 캐싱). SDK 0.30.1 은 `cache_control` 이 beta 네임스페이스에만 있어 `client.beta.promptCaching.messages.create` 를 쓴다(스트리밍·비스트리밍 모두 지원). 캐싱은 순수 인프라 관심사라 **어댑터에만** 두고 도메인·`discussion-prompt`·Port 는 그대로다.

**이유**: 컨텍스트 관리(방 단위 누적 + 매 턴 전체 재전송)는 유지하면서 비용만 줄이려면 캐싱이 정답이다 — 요약·윈도우와 달리 **맥락 손실이 0**. 실측 결과 동일 prefix 재호출 시 1차는 `cache_creation_input_tokens`(쓰기, 정가의 1.25배), 2차부터는 `cache_read_input_tokens`(읽기, 정가의 0.1배)로 처리돼 다회 턴 대화에서 큰 절감. 캐시 최소 토큰(Sonnet 1024) 미만의 짧은 대화에선 자동 비활성이라 부작용 없음.

**트레이드오프**: beta API 의존(SDK 업그레이드 시 표준 GA API 로 이전 예정 — 어댑터만 수정). 캐시 TTL 5분이라 사용자가 오래 자리를 비우면 캐시가 만료돼 재생성(정상 동작, 비용만 1.25배 1회). 요약/슬라이딩 윈도우는 컨텍스트 윈도우 한계(200K)에 실제로 근접하는 초장기 대화가 생길 때 별도 도입(현재 YAGNI).

### ADR-019: 사진 → 한 줄 추출은 Claude Vision (별도 OCR·PhotoStorage 없이)

**결정**: 책 사진에서 구절을 뽑는 기능을 `HighlightExtractor` Port + `ClaudeHighlightExtractor` 어댑터로 구현한다. (1) Tesseract·Google Vision 등 **별도 OCR 없이** Claude 멀티모달 비전으로 추출한다(stack.md). (2) 클라이언트가 이미지를 **다운스케일(긴 변 ~1568px, JPEG)** 해 data URL 로 만들고 `extractHighlightFromImage` Server Action 에 넘긴다 — 서버 액션 본문 한도/토큰 비용을 줄이기 위함(원본 업로드 대신). (3) 추출 텍스트는 **사용자가 검토·수정한 뒤** 기존 `captureHighlight`(TEXT)로 저장한다. **사진 원본 영속화(PhotoStorage·Supabase Storage)는 도입하지 않는다** — 현 가치는 "구절 추출"이고, Storage 버킷·RLS·정리 정책은 비용 대비 과해 보류.

**이유**: 비전 추출이 핵심 차별점이고 이미 도입한 Claude 키·어댑터 패턴(ADR-005)을 재사용한다. 다운스케일은 Claude 가 어차피 큰 이미지를 줄여 처리하므로 화질 손실이 거의 없고 페이로드/비용을 크게 줄인다. 추출↔저장을 분리해, 추출 실패·오인식 시에도 사용자가 직접 입력해 저장할 수 있다(견고성).

**트레이드오프**: 사진 원본이 남지 않아 `Highlight` 는 `NoteSource.TEXT` 로 저장된다(도메인의 `fromPhoto`/`photoUrl` 경로는 PhotoStorage 도입 시 활성화 예정). HEIC 등 일부 포맷은 브라우저 `createImageBitmap` 지원에 의존(미지원 시 직접 입력으로 폴백). 추출 품질은 사진 상태에 좌우되며 사용자 검토 단계가 안전망이다.

### ADR-020: 사진 원본 저장 — Supabase Storage(public 버킷) + PHOTO 출처 Highlight

**결정**: ADR-019 의 "사진 원본 미저장(TEXT 로 저장)"을 뒤집어, 사진으로 담은 한 줄은 **원본 사진을 저장하고 `NoteSource.PHOTO`** 로 남긴다. (1) `PhotoStorage` Port + `SupabasePhotoStorage` 어댑터(Supabase Storage). (2) `highlight-photos` **public 버킷** — 객체 경로 `{userId}/{uuid}.{ext}`, 쓰기/수정/삭제는 Storage RLS 로 본인 폴더에만 제한, 읽기는 공개 URL(추측 불가한 uuid 경로). 기존 책 표지 공개 URL(ADR-016 갱신)과 동일한 정책이라 읽기 경로가 단순(서명 URL 불필요). (3) `CaptureHighlightFromPhotoUseCase` 가 업로드(PhotoStorage)→저장(HighlightRepository)을 한 흐름으로 조율, `captureHighlight` Server Action 이 `photoDataUrl` 유무로 PHOTO/TEXT 분기. (4) 저장하는 이미지는 Vision 추출에 쓴 **다운스케일본(~1568px JPEG)** 을 재사용 — 두 번째 업로드를 피하고 용량/비용을 bound. (5) 한 줄 카드에 사진 썸네일 표시.

**이유**: "사진으로 담은 기록"의 맥락(어떤 책장·지면이었는지)을 남기는 것이 저널링 가치를 높인다. 도메인(`Highlight.fromPhoto`/`photoUrl`)·테이블(`photo_url`+`photo_requires_url` 제약)은 이미 PHOTO 를 지원하고 있어, 빠진 Storage 어댑터만 채우면 됐다. public 버킷은 서명 URL 의 만료·매 조회 서명 비용을 피하면서 기존 공개 표지 URL 패턴과 일관된다.

**트레이드오프**: public 버킷은 URL 이 유출되면 누구나 접근 가능(경로가 추측 불가한 uuid 라 위험은 낮음). 더 강한 비공개가 필요하면 private 버킷 + 서명 URL 로 전환(어댑터·읽기 매퍼만 수정). 원본이 아니라 다운스케일본을 저장하므로 초고해상도 원본은 보존되지 않는다(MVP 의 용량·비용 절충). 업로드 실패 시 한 줄도 저장되지 않는다(원자적).

### ADR-021: 한 줄 고정(pin)·보관(archive) — 상태 컬럼 + 목록 정렬/필터

**결정**: 한 줄 메뉴의 고정·보관 스텁을 실제 기능으로 구현한다. (1) `highlights` 에 `pinned`·`archived` boolean 컬럼 추가. (2) 도메인 `Highlight` 에 `pin()/unpin()/archive()/unarchive()` 불변 전이 메서드 추가(보관 시 고정 자동 해제). (3) **고정 표시 = 기본 목록 상단 정렬 + 핀 배지**(별도 홈 섹션 없이), **보관 처리 = 기본 목록에서 숨김 + '보관함' 필터**(`/highlights?archived=1`). `findAll` 은 보관 제외·고정 우선·최신순, `findArchived` 는 보관함 전용. `ListHighlightsUseCase.execute(scope)` 로 범위 선택. (4) Pin/Archive 유스케이스 + 토글 Server Action, 카드 메뉴가 현재 상태에 따라 라벨 전환('홈에 고정'↔'고정 해제', '보관함에 넣기'↔'보관 해제').

**이유**: 가장 단순하고 직관적인 표시 방식을 택했다(추천안) — 별도 홈 섹션·전용 보관 화면 없이 기존 /highlights 목록의 정렬·필터로 흡수해 화면 추가를 최소화. 보관은 삭제와 달리 되돌릴 수 있어 "지우기 부담 없이 목록을 정리"하는 수단을 준다. 상태 전이는 도메인 메서드(불변)로 강제해 일관성을 지킨다.

**트레이드오프**: `pinned`·`archived` 컬럼 추가로 마이그레이션 + Supabase 타입 재생성(`pnpm supabase:types`)이 필요하다(이 커밋은 `types.gen.ts` 를 수동 반영 — 적용 후 재생성으로 정합). 고정은 전역 1단계(섹션/순서 커스터마이즈 없음), 보관함은 별도 페이지가 아니라 같은 목록의 필터다(규모가 커지면 전용 화면 검토). 권한은 RLS(update 본인) + 유스케이스의 findById(RLS 범위)로 보호.

### ADR-022: '작가 본인' 페르소나 활성화 — 사망 작가 판정(큐레이션 목록)

**결정**: ADR-015 에서 보류했던 **작가 본인 페르소나를 활성화**한다. (1) `Persona.AVAILABLE` 에 `author` 추가 — 선택 가능 목록에 포함. (2) 책별 제약은 도메인 서비스 `Author.isDeceased(name)` 로 판정하고, `StartDiscussionUseCase` 가 `persona.requiresDeceasedAuthor && !Author.isDeceased(book.author)` 면 `AuthorPersonaUnavailableError` 로 거부한다. (3) `Author` 는 시스템 큐레이션 사망 작가 목록(공백 제거 부분 일치)으로 MVP 판정 — 페르소나처럼 코드 상수. (4) UI(new-chat-modal·book-detail)는 이미 `onlyDeceased`/`authorDeceased` 로 비활성·안내가 구현돼 있어, 두 진입 페이지에서 `authorDeceased`를 `Author.isDeceased` 로 채우기만 했다.

**이유**: 사망 작가의 목소리로 작품을 듣는 경험은 책담의 차별 기능인데, "생존 작가 사칭" 우려로 보류돼 있었다. 사망 작가로 한정하면 그 우려가 해소된다. 판정 데이터는 외부 인물 DB(Wikidata 등)가 이상적이나 연동 비용이 커, MVP 는 잘 알려진 사망 작가 큐레이션 목록으로 시작한다. UI 가 이미 대비돼 있어 도메인 판정만 채우면 됐다.

**트레이드오프**: 큐레이션 목록이라 미등록 사망 작가는 생존으로 오판(작가 본인 페르소나 비활성)된다 — 목록 확장 또는 외부 데이터 소스로 개선 가능. 이름 부분 일치라 동명이인·번역 표기 차이로 오판 여지가 있다(정밀 판정은 후속). 저작권(사후 70년) 만료와 '사망'은 다르나, 페르소나 활성 기준은 '사망'으로 둔다(목소리 재현의 윤리 기준).

### ADR-023: 한 줄 태그 — 자유 입력 + 정규화, /highlights 태그 필터

**결정**: 한 줄(Highlight)에 **자유 입력 태그**를 붙인다. (1) `highlights.tags text[] not null default '{}'` + GIN 인덱스. (2) 도메인 `Highlight.tags`(불변·동결) + `normalizeTags`(공백 제거·빈 제거·대소문자 무시 중복 제거·개수 10 상한·태그당 30자 상한) — 자유 입력이라 예외 대신 정규화로 흡수. `fromText`/`fromPhoto`/`edit` 가 태그를 받는다. (3) 캡처·수정 모달은 쉼표 구분 입력(파싱은 UI, 정규화는 도메인). (4) 카드에 `#태그` 칩 표시 → 클릭 시 `/highlights?tag=` 필터. 필터는 목록 상한(200) 내 메모리 필터(대소문자 무시).

**이유**: 태그는 주제·감정으로 한 줄을 묶는 가장 가벼운 분류 수단이고, 자유 입력이 큐레이션 태그보다 진입 장벽이 낮다. 정규화를 도메인에 두어 UI(쉼표 파싱)와 분리하고 일관성을 보장한다. 캡처 모달의 비활성 태그 입력이 이미 있어 자연스럽게 활성화했다.

**트레이드오프**: 자유 입력이라 표기 흔들림(동의어·오타)이 생긴다 — 추천/자동완성은 후속. 필터가 메모리 기반이라 200개 상한에 묶인다(GIN 인덱스는 추후 서버 쿼리 필터 도입 시 활용). 책 단위 태그(book-detail 의 `tags`)는 여전히 미구현(한 줄 태그와 별개).

### ADR-024: PWA 매니페스트 — 설치형 앱 기본 셋업(SVG 아이콘 플레이스홀더)

**결정**: 모바일 PWA 우선 방향(PRD)에 맞춰 PWA 기본 셋업을 둔다. (1) `app/manifest.ts`(Next Metadata 라우트)로 `/manifest.webmanifest` 생성 — name·short_name·standalone·start_url·색(theme=`--terra-500`, bg=`--paper-50`). (2) 브랜드 **SVG 아이콘**(`public/icon.svg` 매니페스트용 + `app/icon.svg` 파비콘) — 폰트 비의존 '밑줄 그은 한 줄' 모티프. (3) `layout` 에 `viewport.themeColor` + `appleWebApp` 메타. 서비스 워커(오프라인)는 도입하지 않는다.

**이유**: 매니페스트+아이콘+테마색만으로 "홈 화면에 추가" 설치 경험의 기본을 확보한다. 색·아이콘을 디자인 토큰과 일치시켜 브랜드 일관성 유지. 오프라인 캐싱(SW)은 데이터가 사용자별·실시간(Supabase/Claude)이라 가치 대비 복잡도가 커 보류.

**트레이드오프**: 아이콘이 SVG 플레이스홀더라 일부 플랫폼(특히 iOS 홈 화면 아이콘)은 래스터 PNG(192/512, maskable)를 요구해 완전한 설치 품질엔 PNG 에셋이 필요(후속). 서비스 워커가 없어 오프라인 동작·설치 프롬프트(beforeinstallprompt) 신뢰성은 제한적 — 정식 PWA(오프라인·푸시)는 후속 결정.

### ADR-025: 한 줄 목록 '더보기' 페이지네이션

**결정**: 한 줄 목록의 고정 상한(200) 대신 '더보기' 페이지네이션을 둔다. (1) `HighlightRepository.findAll/findArchived` 에 **선택적** `HighlightPage{limit,offset}` 추가 — Supabase `.range`, 미지정 시 기존 상한(기존 구현·테스트 무영향). (2) `ListHighlightsUseCase.execute(scope, page?)`. (3) 서버 공용 로더 `loadHighlightViews(scope, page)` 가 한 줄×책 메타를 합쳐 뷰로 — 페이지·`loadMoreHighlights` 액션이 공유. (4) 클라이언트 `HighlightList` 가 첫 페이지(30) 이후를 이어붙인다(id 중복 제거, offset 누적). 태그 필터 시엔 더보기 비활성(메모리 필터).

**이유**: 한 줄은 무한히 쌓이는데 200 상한은 오래된 것을 영구히 가린다. offset 페이지네이션 + '더보기'는 무한 스크롤보다 단순·예측 가능하고 SSR 첫 페이지와 잘 맞는다. Port 옵션을 선택적으로 둬 홈·다른 호출자와 기존 구현을 건드리지 않는다.

**트레이드오프**: offset 방식이라 로드 중 삭제·추가되면 경계에서 누락/중복 가능(중복은 id 로 제거, 누락은 드묾 — 커서 페이지네이션은 후속). 태그 필터는 여전히 메모리 기반이라 페이지네이션 비대상(DB 태그 필터는 후속). 책장·위시·토론 목록은 아직 상한 유지(같은 패턴으로 확장 가능).

### ADR-026: 온보딩 — 데이터 기반(빈 상태) 가이드, 별도 플래그 없음

**결정**: 신규 사용자 온보딩을 **별도 '봤음' 저장 없이** 데이터로 파생한다. 홈에서 `books.length === 0 && highlights.length === 0` 이면 `OnboardingGuide`(3단계: 책 담기 → 한 줄 담기 → 토론)를 상단에 노출하고, 첫 행동으로 데이터가 생기면 자연히 사라진다. 가이드의 CTA 는 기존 트리거(BookSearchTrigger·CaptureTrigger)·토론 링크를 재사용.

**이유**: '온보딩 완료' 플래그를 위한 컬럼·마이그레이션·dismiss 상태 관리 없이도 "처음 비어 있을 때만 안내"라는 목적을 데이터로 충족한다 — 가장 단순하고 상태가 진실과 항상 일치한다. 빈 상태 안내와 자연 소멸이 별도 닫기 버튼보다 깔끔하다.

**트레이드오프**: 사용자가 가이드를 수동으로 닫거나 다시 볼 수 없다(책·한 줄을 모두 지우면 재노출). 단계별 완료 체크나 인터랙티브 투어가 아니라 정적 안내다 — 본격 온보딩(스텝 진행·툴팁 투어)은 후속.

### ADR-027: 권한 이중 방어 — 도메인 소유권 Specification (Highlight 기준 구현)

**결정**: ADR-004(RLS + 도메인 이중 방어)를 **Highlight Aggregate 에 레퍼런스로 구현**한다. `Highlight` 에 `ownerId` 필드를 추가하고(`fromText`/`fromPhoto`/`restore` 의 첫 인자), 소유권 규칙을 `lib/domain/highlight/specs/owned-by.ts` 의 `OwnedBy` Specification 으로 표현한다. 변경 유스케이스(edit·move·pin·archive·delete)는 `loadOwnedHighlight(highlights, id, userId)` 헬퍼로 **조회 → 없으면 `HighlightNotFoundError` → 소유자 아니면 `HighlightAccessDeniedError`** 순서를 거친 뒤에만 변경한다. Server Action 은 인증 세션의 `userId` 를 유스케이스 커맨드에 실어 전달한다. 저장 시 `user_id` 는 여전히 DB default(`auth.uid()`)+RLS 가 채우고 보호하며, 어댑터의 `toDomain` 이 `row.user_id → ownerId` 로 매핑한다.

**이유**: RLS(1차)만으로도 현재는 안전하지만, 백엔드를 별도 서버(NestJS)로 분리하면 RLS 가 사라진다. 도메인 Specification(2차)으로 같은 규칙을 표현해 두면 인프라가 바뀌어도 권한이 유지되고, 유스케이스 단위 테스트로 권한을 빠르게 검증할 수 있다(Fake repo 로 RLS 없이 거부 경로 확인).

**트레이드오프**: 모든 변경 유스케이스가 `userId` 를 받아야 해 커맨드·Server Action 시그니처가 넓어졌다. 또한 '없는 한 줄 삭제'가 멱등 통과에서 `NotFound` 거부로 동작이 바뀌었다(소유권 검증을 위해 항상 조회 선행).

**확장 현황**: 같은 패턴을 **Discussion Aggregate** 로도 적용했다 — `Discussion.ownerId`(start/restore), `lib/domain/discussion/specs/owned-by.ts`, `loadOwnedDiscussion` 헬퍼로 토론 시작(start)·이어가기(continue, 스트리밍 포함)에서 소유권을 검증한다. 스트리밍 Route Handler 는 타인 방(AccessDenied)도 404 로 응답해 존재 여부를 노출하지 않는다.

**ReadingSession 적용 범위**: `ReadingSession` 은 **append-only Aggregate**(생성=`log`, 그 외 `findAll` 읽기)라 per-entity 인가 결정 지점(`loadOwnedX`/`OwnedBy` 소비처)이 없다. 따라서 패턴 중 적용 가능한 부분만 — **엔티티 `ownerId`(log/restore) + 생성 시 설정 + 어댑터가 `user_id = ownerId` 를 명시 영속** — 을 적용했다. 소비처 없는 `OwnedBy` Specification 은 YAGNI 라 두지 않는다.

**읽기 경로 통합(완료)**: 세 Aggregate의 목록 조회 Port에 `userId`를 명시했다 — `HighlightRepository.findAll/findArchived/findByBookId(userId, …)`, `DiscussionRepository.findAll(userId)`, `ReadingSessionRepository.findAll(userId)`. Supabase 어댑터는 `.eq('user_id', userId)`를 RLS 위에 더해(이중 방어), InMemory 어댑터는 각 도메인의 `OwnedBy` Specification으로 필터한다(ReadingSession `OwnedBy`도 이 시점에 소비처가 생겨 추가). 유스케이스(`ListHighlights`/`ListDiscussions`/`GetReadingLog`/`GetBookDetail`)와 진입점이 세션 `userId`를 주입한다. 이로써 RLS 없는 환경에서도 목록/집계가 본인 데이터만 반환함을 유스케이스 단위 테스트로 검증한다(`findById`/`remove`는 mutate 측 `loadOwnedX`가 검증하므로 변경 없음).

**남은 후속**: Book Aggregate 의 ownerId 화(쓰기·읽기 측 동일 패턴).

---

**관련 문서**: [`PRD.md`](./PRD.md) (제품 요구사항), [`ARCHITECTURE.md`](./ARCHITECTURE.md) (디렉토리·도메인 모델·전환 매트릭스), [`specs/`](./specs/) (기능별 상세 설계)

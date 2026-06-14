/**
 * 라우트 상수 중앙 관리.
 * 모든 URL은 이 함수형 상수에서 가져온다 — 하드코딩 금지.
 */
export const ROUTES = {
  HOME: () => '/' as const,
  AUTH: {
    LOGIN: () => '/login' as const,
    SIGNUP: () => '/signup' as const,
    /** OAuth 콜백(Supabase → 앱). 비로그인 접근 허용 경로. */
    CALLBACK: () => '/auth/callback' as const,
    /** OAuth 완료 처리(팝업 닫기/탭 이동). 비로그인 접근 허용 경로. */
    POPUP_COMPLETE: () => '/auth/popup-complete' as const,
  },
  // 대시보드(인증 후) 화면
  DASHBOARD: () => '/home' as const,
  LIBRARY: () => '/library' as const,
  WISHLIST: () => '/wishlist' as const,
  READING: () => '/reading' as const,
  HIGHLIGHTS: () => '/highlights' as const,
  STATS: () => '/stats' as const,
  SETTINGS: () => '/settings' as const,
  BOOKS: {
    LIST: () => '/books' as const,
    DETAIL: (bookId: string) => `/books/${bookId}` as const,
  },
  DISCUSSIONS: {
    LIST: () => '/discussions' as const,
    DETAIL: (id: string) => `/discussions/${id}` as const,
  },
} as const;

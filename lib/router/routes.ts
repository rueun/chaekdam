/**
 * 라우트 상수 중앙 관리.
 * 모든 URL은 이 함수형 상수에서 가져온다 — 하드코딩 금지.
 */
export const ROUTES = {
  HOME: () => '/' as const,
  AUTH: {
    LOGIN: () => '/login' as const,
    SIGNUP: () => '/signup' as const,
  },
  BOOKS: {
    LIST: () => '/books' as const,
    DETAIL: (bookId: string) => `/books/${bookId}` as const,
  },
  NOTES: {
    LIST: () => '/notes' as const,
  },
  DISCUSSIONS: {
    LIST: () => '/discussions' as const,
    DETAIL: (id: string) => `/discussions/${id}` as const,
  },
} as const;

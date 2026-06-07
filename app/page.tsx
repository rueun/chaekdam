import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/router/routes';

// 진입점 — 인증 분기는 middleware 가 처리(비로그인 → 로그인, 로그인 → 홈).
// 여기 도달하면 안전하게 홈으로 보낸다.
export default function RootPage() {
  redirect(ROUTES.DASHBOARD());
}

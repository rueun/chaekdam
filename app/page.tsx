import Link from 'next/link';
import { ROUTES } from '@/lib/router/routes';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">책담</h1>
      <p className="text-lg text-gray-600">
        인상 깊은 구절을 사진 한 장으로 — AI와 시작하는 독서 토론
      </p>
      <nav className="mt-6 flex gap-4 text-sm">
        <Link href={ROUTES.AUTH.LOGIN()} className="text-blue-600 hover:underline">
          로그인
        </Link>
        <Link href={ROUTES.BOOKS.LIST()} className="text-blue-600 hover:underline">
          책 검색
        </Link>
        <Link href={ROUTES.DISCUSSIONS.LIST()} className="text-blue-600 hover:underline">
          내 토론
        </Link>
      </nav>
    </main>
  );
}

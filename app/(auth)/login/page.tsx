import { AuthShell } from '@/components/feature/auth/auth-shell';
import { LoginForm } from '@/components/feature/auth/login-form';

export default function LoginPage() {
  return (
    <AuthShell title="다시 만나서 반가워요" sub="어제 그어둔 한 줄이 기다리고 있어요.">
      <LoginForm />
    </AuthShell>
  );
}

import { AuthShell } from '@/components/feature/auth/auth-shell';
import { SignupForm } from '@/components/feature/auth/signup-form';

export default function SignupPage() {
  return (
    <AuthShell
      title="한 줄을 담을 자리를 만들어요"
      sub="3분이면 시작할 수 있어요. 책담은 광고와 추적이 없어요."
    >
      <SignupForm />
    </AuthShell>
  );
}

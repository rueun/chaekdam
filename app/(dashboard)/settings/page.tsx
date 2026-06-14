import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { SettingsView } from '@/components/feature/settings/settings-view';
import { toCurrentUserView } from '@/components/feature/profile/user-view';
import { createAuthSession } from '@/lib/infrastructure/di-container';
import { ROUTES } from '@/lib/router/routes';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await (await createAuthSession()).getCurrentUser();
  if (!user) redirect(ROUTES.AUTH.LOGIN());

  return (
    <>
      <TopBar title="설정" subtitle="계정과 환경" showSearch={false} />
      <SettingsView user={toCurrentUserView(user)} />
    </>
  );
}

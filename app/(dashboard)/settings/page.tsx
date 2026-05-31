import { TopBar } from '@/components/layout/top-bar';
import { SettingsView } from '@/components/feature/settings/settings-view';

export default function SettingsPage() {
  return (
    <>
      <TopBar title="설정" subtitle="계정과 환경" showSearch={false} />
      <SettingsView />
    </>
  );
}

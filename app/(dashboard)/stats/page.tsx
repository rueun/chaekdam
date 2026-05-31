import { TopBar } from '@/components/layout/top-bar';
import { ReadingLogPanel } from '@/components/feature/reading-log/reading-log';

export default function StatsPage() {
  return (
    <>
      <TopBar
        title="독서 기록"
        subtitle="매일의 독서가 쌓여 한 해의 흐름이 됩니다"
        showSearch={false}
      />
      <ReadingLogPanel />
      {/* TODO(stats): 연간 히트맵 · 장르 분포 · 완독 타임라인 등 확장 예정 */}
    </>
  );
}

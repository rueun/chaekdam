import { TopBar } from './top-bar';
import { Card } from '@/components/ui/card';

/** 아직 조립하지 않은 화면용 플레이스홀더. 셸 내비게이션을 온전히 보이게 한다. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <TopBar title={title} showSearch={false} />
      <Card className="flex min-h-40 items-center justify-center text-[14px] text-[var(--fg-2)]">
        이 화면은 곧 준비됩니다.
      </Card>
    </>
  );
}

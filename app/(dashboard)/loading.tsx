/** 대시보드 페이지 로딩 스켈레톤 — 데이터 로드/탐색 중 셸 안에서 표시. */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-busy aria-label="불러오는 중">
      <div className="bg-surface mb-2 h-7 w-48 rounded-md" />
      <div className="bg-surface mb-8 h-4 w-72 rounded-md" />
      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-divider bg-bg-elevated rounded-lg border p-5">
            <div className="bg-surface mb-3 h-4 w-full rounded" />
            <div className="bg-surface mb-3 h-4 w-5/6 rounded" />
            <div className="bg-surface h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

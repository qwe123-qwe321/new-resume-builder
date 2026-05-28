import { useAiOpsStats } from '@/hooks/use-resume';

export function SettingsPage() {
  const { data, isLoading } = useAiOpsStats();
  const stats = (data || {}) as {
    totalSessions?: number;
    successRate?: number;
    failedSessions?: number;
    avgLatency7d?: number;
    estimatedCost?: number;
    actionDistribution?: Array<{ action: string; count: number }>;
    actionFailedDistribution?: Array<{ action: string; count: number }>;
    topErrors?: Array<{ error: string; count: number }>;
    queueWaiting?: number;
    queueActive?: number;
    throughput1h?: number;
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI 运营面板</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">总会话</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : stats.totalSessions ?? 0}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">成功率</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : `${Math.round((stats.successRate ?? 0) * 100)}%`}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">近7天平均延迟</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : `${Math.round(stats.avgLatency7d ?? 0)}ms`}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">估算成本</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : `$${(stats.estimatedCost ?? 0).toFixed(2)}`}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">失败会话数</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : stats.failedSessions ?? 0}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">失败率</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : `${Math.round(((stats.failedSessions ?? 0) / Math.max(stats.totalSessions ?? 1, 1)) * 100)}%`}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">队列等待中</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : stats.queueWaiting ?? 0}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">队列执行中</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : stats.queueActive ?? 0}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-xs text-muted-foreground">近1小时吞吐</p><p className="text-2xl font-bold mt-1">{isLoading ? '-' : stats.throughput1h ?? 0}</p></div>
      </div>
      <div className="glass rounded-xl p-5 mt-6">
        <h2 className="text-lg font-semibold mb-3">按 action 分布</h2>
        <div className="space-y-2">
          {(stats.actionDistribution || []).map((item) => (
            <div key={item.action} className="flex items-center justify-between text-sm border border-border rounded-lg px-3 py-2">
              <span>{item.action}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
          {!isLoading && (!stats.actionDistribution || stats.actionDistribution.length === 0) && (
            <p className="text-sm text-muted-foreground">暂无数据</p>
          )}
        </div>
      </div>
      <div className="glass rounded-xl p-5 mt-6">
        <h2 className="text-lg font-semibold mb-3">按 action 失败分布</h2>
        <div className="space-y-2">
          {(stats.actionFailedDistribution || []).map((item) => (
            <div key={item.action} className="flex items-center justify-between text-sm border border-border rounded-lg px-3 py-2">
              <span>{item.action}</span>
              <span className="font-semibold text-destructive">{item.count}</span>
            </div>
          ))}
          {!isLoading && (!stats.actionFailedDistribution || stats.actionFailedDistribution.length === 0) && (
            <p className="text-sm text-muted-foreground">暂无失败数据</p>
          )}
        </div>
      </div>
      <div className="glass rounded-xl p-5 mt-6">
        <h2 className="text-lg font-semibold mb-3">最近失败 Top 原因</h2>
        <div className="space-y-2">
          {(stats.topErrors || []).map((item) => (
            <div key={`${item.error}-${item.count}`} className="text-sm border border-border rounded-lg px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{item.error}</span>
                <span className="font-semibold text-destructive">{item.count}</span>
              </div>
            </div>
          ))}
          {!isLoading && (!stats.topErrors || stats.topErrors.length === 0) && (
            <p className="text-sm text-muted-foreground">暂无失败原因统计</p>
          )}
        </div>
      </div>
    </div>
  );
}

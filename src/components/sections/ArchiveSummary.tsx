import { MetricCard } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import type { StockPosition } from '@/types';

interface ArchiveSummaryProps {
  archiveStocks: StockPosition[];
}

export function ArchiveSummary({ archiveStocks }: ArchiveSummaryProps) {
  const realizedPnl = archiveStocks.reduce((sum, p) => sum + p.pnlValue, 0);
  const wins = archiveStocks.filter((s) => s.tone === 'win').length;
  const losses = archiveStocks.filter((s) => s.tone === 'loss').length;
  const winRate = archiveStocks.length > 0 ? Math.round((wins / archiveStocks.length) * 100) : 0;

  return (
    <section className="archive-summary">
      <div>
        <p>Realized P&L</p>
        <strong>{formatCurrency(realizedPnl)}</strong>
        <span>{archiveStocks.length} archived positions</span>
      </div>
      <div className="stats-row">
        <MetricCard label="TRADES" value={String(archiveStocks.length)} />
        <MetricCard label="WIN / LOSS" value={`${wins} / ${losses}`} tone={wins >= losses ? 'win' : 'loss'} />
        <MetricCard label="WIN RATE" value={`${winRate}%`} tone={winRate >= 50 ? 'win' : 'loss'} />
      </div>
    </section>
  );
}

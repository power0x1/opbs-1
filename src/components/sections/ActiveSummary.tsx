import { HelpCircle } from 'lucide-react';
import { MetricCard } from '@/components/ui';
import { formatCurrency, formatCompact } from '@/utils/format';

interface ActiveSummaryProps {
  totalPnl: number;
  invested: number;
  activeCount: number;
  label: string;
}

export function ActiveSummary({ totalPnl, invested, activeCount, label }: ActiveSummaryProps) {
  const dayReturn = invested > 0 ? (totalPnl / invested) * 100 : 0;

  return (
    <section className="hero-card positive-card">
      <div className="hero-grid">
        <div>
          <p className="eyebrow">UNREALIZED P&L <HelpCircle size={14} /></p>
          <div className="hero-value positive">{formatCurrency(totalPnl)}</div>
          <div className="hero-detail">
            <span className="gain-chip">{dayReturn >= 0 ? '+' : ''}{dayReturn.toFixed(2)}%</span>
            <span>•</span>
            <span>{activeCount} {label}</span>
          </div>
        </div>
        <div className="capital-box">
          <span>Capital in use</span>
          <strong>{formatCompact(invested)}</strong>
        </div>
      </div>
      <div className="stats-row">
        <MetricCard label={label.toUpperCase()} value={`${activeCount} Active`} tone="win" />
        <MetricCard label="INVESTED" value={formatCompact(invested)} />
        <MetricCard label="DAY RETURN" value={`${dayReturn >= 0 ? '+' : ''}${dayReturn.toFixed(1)}%`} tone={dayReturn >= 0 ? 'win' : 'loss'} />
      </div>
    </section>
  );
}

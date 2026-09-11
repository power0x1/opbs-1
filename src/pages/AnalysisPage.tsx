import { useState, useMemo } from 'react';
import { ScreenHeader } from '@/components/layout';
import { MetricCard } from '@/components/ui';
import { usePortfolio } from '@/hooks';
import { AnalysisDayItem } from '@/components/cards';
import { buildAnalysisDays, type AnalysisRange } from '@/services';
import { formatCurrency } from '@/utils/format';

interface AnalysisPageProps {
  onAction: (message: string) => void;
}

export function AnalysisPage({ onAction }: AnalysisPageProps) {
  const {
    netPnl,
    totalTrades,
    winCount,
    winRate,
    fnoActiveTrades,
    fnoClosedTrades,
    allCoinbaseTrades,
  } = usePortfolio();

  const [range, setRange] = useState<AnalysisRange>('Day');

  const allFnoTrades = useMemo(
    () => [...fnoActiveTrades, ...fnoClosedTrades],
    [fnoActiveTrades, fnoClosedTrades],
  );

  const days = useMemo(
    () => buildAnalysisDays(allFnoTrades, allCoinbaseTrades, range),
    [allFnoTrades, allCoinbaseTrades, range],
  );

  const lossCount = totalTrades - winCount;

  return (
    <>
      <ScreenHeader title="Analysis" />
      <section className={`hero-card ${netPnl >= 0 ? 'positive-card' : 'closed-card'}`}>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">NET REALIZED P&L</p>
            <div className={`hero-value ${netPnl >= 0 ? 'positive' : 'loss'}`}>
              {formatCurrency(netPnl)}
            </div>
            <div className="hero-detail">Across all recommendation engines</div>
          </div>
        </div>
        <div className="stats-row">
          <MetricCard label="TOTAL TRADES" value={String(totalTrades)} />
          <MetricCard label="WIN / LOSS" value={`${winCount} / ${lossCount}`} />
          <MetricCard
            label="WIN RATE"
            value={`${winRate}%`}
            tone={winRate >= 50 ? 'win' : 'loss'}
          />
        </div>
      </section>
      <div className="section-heading">
        <h2>PERFORMANCE BREAKDOWN</h2>
        <div className="range-selector">
          {(['Day', 'Week', 'Month'] as AnalysisRange[]).map((r) => (
            <button
              key={r}
              className={`range-pill ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="stack">
        {days.map((day) => (
          <AnalysisDayItem key={day.date} day={day} onAction={onAction} />
        ))}
      </div>
    </>
  );
}

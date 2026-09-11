import { useState } from 'react';
import { ScreenHeader } from '@/components/layout';
import { Segment, EmptyState, MetricCard } from '@/components/ui';
import { usePortfolio } from '@/hooks';
import { PositionCard, ClosedPositionCard } from '@/components/cards';
import { ActiveSummary } from '@/components/sections';
import { formatCurrency } from '@/utils/format';
import type { PositionRow } from '@/types';

interface PositionsPageProps {
  onAction: (message: string) => void;
}

function ClosedPositionsSummary({ closedPositions }: { closedPositions: PositionRow[] }) {
  const realizedPnl = closedPositions.reduce((sum, p) => sum + p.pnlValue, 0);
  const wins = closedPositions.filter((s) => s.tone === 'win').length;
  const losses = closedPositions.filter((s) => s.tone === 'loss').length;
  const winRate = closedPositions.length > 0 ? Math.round((wins / closedPositions.length) * 100) : 0;

  return (
    <section className="archive-summary">
      <div>
        <p>Realized P&L</p>
        <strong>{formatCurrency(realizedPnl)}</strong>
        <span>{closedPositions.length} closed positions</span>
      </div>
      <div className="stats-row">
        <MetricCard label="TRADES" value={String(closedPositions.length)} />
        <MetricCard label="WIN / LOSS" value={`${wins} / ${losses}`} tone={wins >= losses ? 'win' : 'loss'} />
        <MetricCard label="WIN RATE" value={`${winRate}%`} tone={winRate >= 50 ? 'win' : 'loss'} />
      </div>
    </section>
  );
}

export function PositionsPage({ onAction }: PositionsPageProps) {
  const { openPositions, closedPositions } = usePortfolio();
  const [mode, setMode] = useState('Active');

  const totalPnl = openPositions.reduce((sum, s) => sum + s.pnlValue, 0);
  const invested = openPositions.reduce((sum, s) => sum + s.invested, 0);

  return (
    <>
      <ScreenHeader title="Positions" />
      <Segment
        active={mode}
        onChange={setMode}
        items={[
          { label: 'Active', count: String(openPositions.length) },
          { label: 'Closed', count: String(closedPositions.length) },
        ]}
      />
      {mode === 'Active' ? (
        openPositions.length === 0 ? (
          <EmptyState title="No active positions" body="Execute a trade from the Options or Stocks page to create a position." />
        ) : (
          <>
            <ActiveSummary
              totalPnl={totalPnl}
              invested={invested}
              activeCount={openPositions.length}
              label="positions"
            />
            <div className="section-heading">
              <h2>ACTIVE POSITIONS</h2>
              <span className="realtime"><span className="live-dot" /> Portfolio</span>
            </div>
            <div className="stack">
              {openPositions.map((pos) => (
                <PositionCard key={pos.id} position={pos} onAction={onAction} />
              ))}
            </div>
          </>
        )
      ) : closedPositions.length === 0 ? (
        <EmptyState title="No closed positions" body="Your exited positions will appear here." />
      ) : (
        <>
          <ClosedPositionsSummary closedPositions={closedPositions} />
          <div className="section-heading">
            <h2>CLOSED POSITIONS</h2>
            <span className="sort-button">Sorted by date</span>
          </div>
          <div className="stack">
            {closedPositions.map((pos) => (
              <ClosedPositionCard key={pos.id} position={pos} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

import { useState } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { ScreenHeader } from '@/components/layout';
import { Segment, EmptyState, MetricCard } from '@/components/ui';
import type { ViewMode } from '@/types';
import { formatCurrency, formatCompact } from '@/utils/format';
import { usePortfolio } from '@/hooks';
import { OpenOptionCard, ClosedOptionCard, FilterDropdown } from '@/components/cards';
import { ClosedOptionsSummary, ClosedOptionsHistory } from '@/components/sections';

interface OptionsPageProps {
  onAction: (message: string) => void;
}

export function OptionsPage({ onAction }: OptionsPageProps) {
  const { openOptions, closedOptions } = usePortfolio();
  const [mode, setMode] = useState<ViewMode>('options');
  const [closedSubView, setClosedSubView] = useState<'closed' | 'archived'>('closed');
  const [archiveFilter, setArchiveFilter] = useState('All');

  const openMetrics = openOptions.map((p) => {
    let entry = 0;
    let target = 0;
    let qty = 1;
    let reqCap = p.requiredCapital || p.marginRequired || 0;

    if (p.source === 'coinbase') {
      entry =
        p.iPrice ||
        p.recommendedPrice1 ||
        parseFloat(p.entry.replace(/[^0-9.-]/g, '')) ||
        0;
      target = p.target || p.targetPrice || 0;
      const match = p.subtitle?.match(/(\d+)\s*Qty/i);
      qty = p.quantity || (match ? parseInt(match[1], 10) : 1);
    } else {
      entry =
        p.entryPrice ||
        p.recommendedPrice ||
        p.entryStartPrice ||
        parseFloat(p.entry.replace(/[^0-9.-]/g, '')) ||
        0;
      target =
        p.targetPrice ||
        (p.multiTargetList && p.multiTargetList[0]?.target) ||
        0;
      const match = p.subtitle?.match(/(\d+)\s*Qty/i);
      qty = p.lotSize || (match ? parseInt(match[1], 10) : 1);
    }

    if (!reqCap && entry > 0 && qty > 0) {
      reqCap = entry * qty;
    }

    let val = 0;
    let pct = 0;
    if (p.returnMetric) {
      val = p.returnMetric.value;
      pct = p.returnMetric.percentage;
    } else if (entry > 0 && target > 0) {
      const diff = target - entry;
      val = diff * qty;
      pct = (diff / entry) * 100;
    } else if (p.potentialReturns) {
      val = p.potentialReturns.value ?? 0;
      pct = p.potentialReturns.percentage ?? 0;
    }

    return { val, pct, reqCap };
  });

  const totalPotentialMoney = openMetrics.reduce((sum, m) => sum + m.val, 0);
  const avgPotentialMoney = openOptions.length > 0 ? totalPotentialMoney / openOptions.length : 0;
  const avgPotentialReturnPct = openOptions.length > 0
    ? openMetrics.reduce((sum, m) => sum + m.pct, 0) / openOptions.length
    : 0;
  const invested = openOptions.reduce((sum, p) => sum + p.invested, 0);
  const totalCapitalInUse = openMetrics.reduce((sum, m) => sum + m.reqCap, 0) || invested;
  const isProfit = avgPotentialMoney >= 0;

  return (
    <>
      <ScreenHeader title="Options" />
      <Segment
        active={mode}
        onChange={(value) => {
          setMode(value as ViewMode);
          if (value !== 'closed') {
            setClosedSubView('closed');
          }
        }}
        items={[
          { label: 'options', count: String(openOptions.length) },
          { label: 'futures', count: String(openOptions.length) },
          { label: 'closed', count: String(closedOptions.length) },
        ]}
      />
      {mode === 'options' || mode === 'futures' || mode === 'open' ? (
        openOptions.length === 0 ? (
          <EmptyState
            title={mode === 'futures' ? 'No active futures' : 'No active options'}
            body={mode === 'futures' ? 'Your live future positions will appear here.' : 'Your live option positions will appear here.'}
          />
        ) : (
          <>
            <section className={`hero-card ${isProfit ? 'positive-card' : 'negative-card'}`}>
              <div className="hero-grid items-center">
                <div className="flex flex-col justify-center">
                  <span className="eyebrow !m-0 !text-[#a2acc1]">Capital in use</span>
                  <div className="hero-value !text-[#ff5252] mt-1.5">
                    {formatCompact(totalCapitalInUse)}
                  </div>
                </div>
                <div className="flex flex-col items-end text-right justify-center">
                  <div className="hero-value !text-[#22c55e]">
                    {formatCurrency(avgPotentialMoney)}
                  </div>
                  <div className="hero-detail justify-end mt-1.5">
                    <span className="gain-chip !bg-[#0e2d1d] !text-[#34d399] border border-[#164e32] flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono font-bold text-[13px]">
                      <TrendingUp className="h-3.5 w-3.5 text-[#34d399]" />
                      <span>
                        {avgPotentialReturnPct >= 0 ? '+' : ''}{avgPotentialReturnPct.toFixed(2)}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="stats-row !grid-cols-2">
                <MetricCard label="OPEN POSITIONS" value={`${openOptions.length} Active`} tone="win" />
                <MetricCard
                  label="AVG POTENTIAL RETURN"
                  value={`${avgPotentialReturnPct >= 0 ? '+' : ''}${avgPotentialReturnPct.toFixed(1)}%`}
                  tone={avgPotentialReturnPct >= 0 ? 'win' : 'loss'}
                />
              </div>
            </section>
            <div className="section-heading">
              <h2>{mode === 'futures' ? 'Active Futures' : 'Active Options'} ({openOptions.length})</h2>
            </div>
            <div className="stack">
              {openOptions.map((position) => (
                <OpenOptionCard key={position.id} position={position} onAction={onAction} />
              ))}
            </div>
          </>
        )
      ) : closedSubView === 'archived' ? (
        <div className="archive-view">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setClosedSubView('closed')}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#ff7a3d] hover:text-[#ff9d5c] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Closed</span>
            </button>
          </div>

          <div className="section-heading mb-4">
            <h2>Archived (0)</h2>
            <FilterDropdown
              label="Filter"
              value={archiveFilter}
              options={['All', 'Target hit', 'Cost to cost', 'Stop loss']}
              onChange={setArchiveFilter}
            />
          </div>

          <EmptyState
            title="No archived options"
            body="Archived trades will appear here."
          />
        </div>
      ) : closedOptions.length === 0 ? (
        <EmptyState title="No closed positions" body="Your settled option trades will appear here." />
      ) : (
        <>
          <ClosedOptionsSummary closedPositions={closedOptions} />
          <ClosedOptionsHistory
            closedPositions={closedOptions}
            onOpenArchive={() => setClosedSubView('archived')}
          />
          <div className="stack">
            {closedOptions.map((position) => (
              <ClosedOptionCard key={position.id} position={position} onAction={onAction} />
            ))}
          </div>
          <br />
        </>
      )}
    </>
  );
}

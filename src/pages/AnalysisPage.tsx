import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { ScreenHeader } from '@/components/layout';
import { MetricCard, EmptyState } from '@/components/ui';
import { usePortfolio } from '@/hooks';
import { SourceFilterDropdown, SOURCE_OPTIONS } from '@/components/cards/SourceFilterDropdown';
import { AnalysisDayItem } from '@/components/cards/AnalysisDayItem';
import {
  buildAnalysisDays,
  computeFilteredMetrics,
  type AnalysisRange,
} from '@/services';
import { formatCurrency } from '@/utils/format';

interface AnalysisPageProps {
  onAction: (message: string) => void;
}

export function AnalysisPage({ onAction }: AnalysisPageProps) {
  const {
    fnoClosedTrades,
    allCoinbaseTrades,
  } = usePortfolio();

  const [range, setRange] = useState<AnalysisRange>('Day');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    () => new Set(['FNO', 'COINBASE']),
  );

  // Closed/settled FNO trades only (no active trades)
  const closedFnoTrades = useMemo(() => {
    return fnoClosedTrades.filter(
      (t) =>
        t.status !== 'active' &&
        t.status !== 'Live' &&
        Boolean(t.exitDate || t.returns || t.status === 'closed' || t.status === 'settled'),
    );
  }, [fnoClosedTrades]);

  // Closed/exited Coinbase trades only (no active trades)
  const closedCoinbaseTrades = useMemo(() => {
    return allCoinbaseTrades.filter(
      (t) =>
        Boolean(
          t.exited ||
            t.status === 'closed' ||
            t.status === 'Exited' ||
            t.ExitTime ||
            t.exitPrice ||
            t.EPrices,
        ),
    );
  }, [allCoinbaseTrades]);

  // Source Counts (closed trades only)
  const sourceCounts = useMemo(() => {
    const fnoCount = closedFnoTrades.length;
    const cbCount = closedCoinbaseTrades.length;
    return {
      ALL: fnoCount + cbCount,
      FNO: fnoCount,
      COINBASE: cbCount,
    };
  }, [closedFnoTrades.length, closedCoinbaseTrades.length]);

  const isAllSources =
    selectedSources.has('ALL') ||
    selectedSources.size === SOURCE_OPTIONS.length;

  const handleToggleSource = (sourceId: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      next.delete('ALL');

      if (isAllSources) {
        // If all were active and user clicks one, uncheck only that one
        next.clear();
        for (const opt of SOURCE_OPTIONS) {
          if (opt.id !== sourceId) {
            next.add(opt.id);
          }
        }
      } else if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    for (const opt of SOURCE_OPTIONS) next.add(opt.id);
    setSelectedSources(next);
  };

  const handleUnselectAll = () => {
    setSelectedSources(new Set<string>());
  };

  // Filtered breakdown rows (closed trades only)
  const days = useMemo(
    () =>
      buildAnalysisDays(
        closedFnoTrades,
        closedCoinbaseTrades,
        range,
        undefined, // active trades are excluded
        selectedSources,
      ),
    [closedFnoTrades, closedCoinbaseTrades, range, selectedSources],
  );

  // Filtered trade performance metrics (closed trades only)
  const filteredMetrics = useMemo(
    () =>
      computeFilteredMetrics(
        closedFnoTrades,
        closedCoinbaseTrades,
        undefined, // active trades are excluded
        selectedSources,
      ),
    [closedFnoTrades, closedCoinbaseTrades, selectedSources],
  );

  const isPositive = filteredMetrics.netPnl >= 0;

  return (
    <>
      <ScreenHeader title="Analysis" />

      {/* Trade Analytics Summary Card */}
      <section
        className={`hero-card ${isPositive ? 'positive-card' : 'loss-card'}`}
      >
        <div className="hero-grid">
          <div>
            <p className="eyebrow">
              <TrendingUp
                size={14}
                className={isPositive ? 'win' : 'loss'}
              />
              NET REALIZED P&L
            </p>
            <div
              className={`hero-value ${isPositive ? 'positive' : 'loss'}`}
            >
              {formatCurrency(filteredMetrics.netPnl)}
            </div>
          </div>
        </div>
        <div className="stats-row">
          <MetricCard
            label="TOTAL TRADES"
            value={String(filteredMetrics.totalTrades)}
          />
          <MetricCard
            label="WIN / LOSS"
            value={`${filteredMetrics.winCount} / ${filteredMetrics.lossCount}`}
            tone={
              filteredMetrics.winCount >= filteredMetrics.lossCount
                ? 'win'
                : 'loss'
            }
          />
          <MetricCard
            label="WIN RATE"
            value={`${filteredMetrics.winRate}%`}
            tone={filteredMetrics.winRate >= 50 ? 'win' : 'loss'}
          />
        </div>
      </section>

      {/* Controls row: Day/Week/Month on LEFT, Filter dropdown on RIGHT */}
      <div className="flex items-center justify-between gap-2 mt-4 mb-3">
        <div className="range-selector">
          {(['Day', 'Week', 'Month'] as AnalysisRange[]).map((r) => (
            <button
              key={r}
              type="button"
              id={`range-pill-${r.toLowerCase()}`}
              className={`range-pill ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <SourceFilterDropdown
          selectedSources={selectedSources}
          onToggleSource={handleToggleSource}
          onSelectAll={handleSelectAll}
          onUnselectAll={handleUnselectAll}
          sourceCounts={sourceCounts}
        />
      </div>

      {/* Breakdown Items */}
      {days.length === 0 ? (
        <EmptyState
          title="No Performance Data"
          body={
            selectedSources.size === 0
              ? 'All sources unselected. Please select a source to view performance breakdown.'
              : `No trade recommendations found for the selected filter (${
                  isAllSources ? 'All sources' : Array.from(selectedSources).join(', ')
                }) in the ${range.toLowerCase()} range.`
          }
        />
      ) : (
        <div className="day-list" key={`${range}-${Array.from(selectedSources).join('-')}`}>
          {days.map((day) => (
            <AnalysisDayItem key={day.date} day={day} onAction={onAction} />
          ))}
        </div>
      )}
    </>
  );
}


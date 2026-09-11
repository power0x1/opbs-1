import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricCard } from '@/components/ui';
import { formatCurrency, formatCompact } from '@/utils/format';
import type { ClosedOptionPosition } from '@/types';

interface ClosedOptionsSummaryProps {
  closedPositions: ClosedOptionPosition[];
}

export function ClosedOptionsSummary({ closedPositions }: ClosedOptionsSummaryProps) {
  const closedMetrics = closedPositions.map((p) => {
    let val = p.pnlValue ?? (p.returns?.value ?? p.potentialReturns?.value ?? 0);
    let pct =
      p.returns?.percentage ??
      p.potentialReturns?.percentage ??
      (parseFloat((p.percent || '0').replace(/[^0-9.-]/g, '')) || 0);

    const isTradeLoss =
      p.tone === 'loss' ||
      p.returns?.isProfit === false ||
      p.exitType === 'STOP_LOSS' ||
      val < 0 ||
      pct < 0;

    if (isTradeLoss) {
      val = -Math.abs(val);
      pct = -Math.abs(pct);
    } else if (val > 0 || pct > 0) {
      val = Math.abs(val);
      pct = Math.abs(pct);
    }

    let cap = 0;
    const match = p.subtitle?.match(/(\d+)\s*Qty/i);
    const qtyFromSubtitle = match ? parseInt(match[1], 10) : 0;

    if (p.source === 'coinbase') {
      const entryNum =
        typeof p.entryPrice === 'number' && p.entryPrice > 0
          ? p.entryPrice
          : parseFloat(String(p.entry).replace(/[^0-9.-]/g, '')) || 0;
      const qty = p.Quantity || qtyFromSubtitle || 1;
      cap = entryNum * qty;
    } else {
      const entryNum =
        (p.entryPrice && p.entryPrice > 0 ? p.entryPrice : 0) ||
        parseFloat(String(p.entry).replace(/[^0-9.-]/g, '')) ||
        0;
      const qty = p.lotSize || qtyFromSubtitle || 1;
      cap = entryNum * qty;
    }
    return { val, pct, cap };
  });

  const totalCapitalInUse = closedMetrics.reduce((sum, m) => sum + m.cap, 0);
  // Sum of all returns for money
  const totalReturnMoney = closedMetrics.reduce((sum, m) => sum + m.val, 0);
  // Sum of all percentages (e.g. +2 + 3 - 3)
  const totalReturnPct = closedMetrics.reduce((sum, m) => sum + m.pct, 0);

  // Return on Investment (ROI) on capital
  const roiPct =
    totalCapitalInUse > 0
      ? (totalReturnMoney / totalCapitalInUse) * 100
      : 0;

  // Average return percentage per trade
  const avgReturnPct =
    closedPositions.length > 0
      ? totalReturnPct / closedPositions.length
      : 0;

  const isProfit = totalReturnMoney >= 0;

  return (
    <section className={`hero-card ${isProfit ? 'positive-card' : 'negative-card'}`}>
      <div className="hero-grid items-center">
        {/* Left: Capital in use in red with ROI icon % badge */}
        <div className="flex flex-col justify-center">
          <span className="eyebrow !m-0 !text-[#a2acc1]">Capital in use</span>
          <div className="hero-value !text-[#ff5252] mt-1.5">
            {formatCompact(totalCapitalInUse)}
          </div>
          <div className="hero-detail justify-start mt-1.5">
            <span
              className={`gain-chip flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono font-bold text-[13px] ${
                roiPct >= 0
                  ? '!bg-[#0e2d1d] !text-[#34d399] border border-[#164e32]'
                  : '!bg-[#331114] !text-[#ff6b6b] border border-[#551d22]'
              }`}
              title={`ROI on Capital: ${roiPct >= 0 ? '+' : ''}${roiPct.toFixed(2)}%`}
            >
              {roiPct >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-[#34d399]" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-[#ff6b6b]" />
              )}
              <span>
                {roiPct >= 0 ? '+' : ''}
                {roiPct.toFixed(2)}%
              </span>
            </span>
          </div>
        </div>

        {/* Right: Total return in green/red, with icon and cumulative sum of percentages */}
        <div className="flex flex-col items-end text-right justify-center">
          <div className={`hero-value ${isProfit ? '!text-[#22c55e]' : '!text-[#ff5252]'}`}>
            {formatCurrency(totalReturnMoney)}
          </div>
          <div className="hero-detail justify-end mt-1.5">
            <span
              className={`gain-chip flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono font-bold text-[13px] ${
                totalReturnPct >= 0
                  ? '!bg-[#0e2d1d] !text-[#34d399] border border-[#164e32]'
                  : '!bg-[#331114] !text-[#ff6b6b] border border-[#551d22]'
              }`}
            >
              {totalReturnPct >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-[#34d399]" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-[#ff6b6b]" />
              )}
              <span>
                {totalReturnPct >= 0 ? '+' : ''}
                {totalReturnPct.toFixed(2)}%
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="stats-row !grid-cols-2">
        <MetricCard label="CLOSED POSITIONS" value={`${closedPositions.length} Settled`} tone="win" />
        <MetricCard
          label="AVG RETURN"
          value={`${avgReturnPct >= 0 ? '+' : ''}${avgReturnPct.toFixed(1)}%`}
          tone={avgReturnPct >= 0 ? 'win' : 'loss'}
        />
      </div>
    </section>
  );
}

interface ClosedOptionsHistoryProps {
  closedPositions: ClosedOptionPosition[];
  onOpenArchive?: () => void;
}

export function ClosedOptionsHistory({ closedPositions, onOpenArchive }: ClosedOptionsHistoryProps) {
  return (
    <div className="section-heading history-heading">
      <h2>
        <History size={18} /> Closed ({closedPositions.length})
      </h2>
      {onOpenArchive ? (
        <button
          type="button"
          onClick={onOpenArchive}
          className="text-[15px] font-medium text-[#ff7a3d] hover:text-[#ff9d5c] transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
        >
          Archived →
        </button>
      ) : (
        <span style={{ fontSize: '15px' }}>Archived →</span>
      )}
    </div>
  );
}

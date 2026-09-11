import { useState } from 'react';
import { Copy, Check, Zap, ArrowUpRight, ArrowDownRight, FileText, Wallet } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { StockPosition } from '@/types';
import { createPosition } from '@/services';
import { formatPrice, formatCurrency, formatDateTime } from '@/utils/format';

interface StockCardProps {
  stock: StockPosition;
  onAction: (message: string) => void;
}

export function StockCard({ stock, onAction }: StockCardProps) {
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleExecute() {
    setExecuting(true);
    const orderQty = stock.source === 'coinbase'
      ? (stock.quantity ?? 1)
      : (stock.recommendedQty ?? 10);

    const parsedEntry = parseFloat(stock.entry.replace(/[^0-9.-]/g, '')) || 100;
    const rawEntry = stock.source === 'coinbase'
      ? (stock.iPrice ?? parsedEntry)
      : (stock.recommendedAt ?? stock.entryStartPrice ?? parsedEntry);

    try {
      await createPosition({
        symbol: stock.symbol,
        name: stock.name,
        optionType: 'CE',
        entryPrice: rawEntry,
        quantity: orderQty,
        status: 'open',
        source: stock.source,
      });
      onAction(`${stock.title} order placed (${orderQty} Qty)`);
    } catch {
      onAction('Failed to place order');
    } finally {
      setExecuting(false);
    }
  }

  function handleCopySymbol() {
    navigator.clipboard?.writeText(stock.symbol || stock.title);
    setCopied(true);
    onAction(`Copied ${stock.symbol || stock.title} to clipboard`);
    setTimeout(() => setCopied(false), 1500);
  }

  // Horizon for Liquide, Duration for Coinbase (shown before source)
  const horizonOrDuration = stock.source === 'liquide' ? stock.horizon : stock.duration;

  // Entry Range display
  // Liquide: entryStartPrice - entryEndPrice range
  // Coinbase: recommendedPrice1 - recommendedPrice2 range
  const entryRangeDisplay = (() => {
    if (stock.source === 'liquide') {
      if (stock.entryStartPrice && stock.entryEndPrice) {
        return `${formatPrice(stock.entryStartPrice)} - ${formatPrice(stock.entryEndPrice)}`;
      }
      return stock.entryRangeText || stock.entry || '—';
    } else {
      if (stock.recommendedPrice1 && stock.recommendedPrice2) {
        return `${formatPrice(stock.recommendedPrice1)} - ${formatPrice(stock.recommendedPrice2)}`;
      }
      return stock.recommendedRangeText || stock.entry || '—';
    }
  })();

  // Sub-detail under entry range:
  // Liquide: adviceDate
  // Coinbase: entryTime under entry range
  const entrySubDetail = (() => {
    if (stock.source === 'liquide') {
      return stock.adviceDate || 'Active Call';
    }
    return stock.entryTimeText || (stock.entryTime ? formatDateTime(stock.entryTime) : undefined) || 'Live Call';
  })();

  // Target and Stop Loss
  const targetDisplay = (() => {
    if (stock.source === 'liquide') {
      return stock.targetPriceText || (stock.targetPrice && stock.targetPrice > 0 ? formatPrice(stock.targetPrice) : '—');
    }
    return stock.targetText || (stock.target && stock.target > 0 ? formatPrice(stock.target) : '—');
  })();

  const stopLossDisplay = (() => {
    if (stock.source === 'liquide') {
      return stock.stopLossText || (stock.stopLoss && stock.stopLoss > 0 ? formatPrice(stock.stopLoss) : '—');
    }
    return stock.slText || (stock.sl && stock.sl > 0 ? formatPrice(stock.sl) : '—');
  })();

  // Recommended / Entry Price for right-side sub-row:
  // Liquide: recommendedAt (labeled "Entry")
  // Coinbase: iPrice (labeled "Entry") + quantity
  const bottomPriceInfo = (() => {
    if (stock.source === 'liquide') {
      if (stock.recommendedAt && stock.recommendedAt > 0) {
        return {
          label: 'Entry',
          value: formatPrice(stock.recommendedAt),
          extra: stock.recommendedQty ? `${stock.recommendedQty} Qty` : undefined,
        };
      }
      return null;
    } else {
      if (stock.iPrice && stock.iPrice > 0) {
        return {
          label: 'Entry',
          value: formatPrice(stock.iPrice),
          extra: stock.quantity ? `${stock.quantity} Qty` : undefined,
        };
      }
      return null;
    }
  })();

  // Potential Upside / Return Metric Card (alike options potential return)
  const returnMetric = (() => {
    const entry =
      stock.source === 'liquide'
        ? stock.recommendedAt || stock.entryStartPrice || 0
        : stock.iPrice || stock.recommendedPrice1 || 0;

    const target =
      stock.source === 'liquide'
        ? stock.targetPrice || 0
        : stock.target || 0;

    const qty =
      stock.source === 'liquide'
        ? stock.recommendedQty || 1
        : stock.quantity || 1;

    let pct: number | undefined = undefined;
    if (stock.potentialUpside !== undefined) {
      pct = Number(stock.potentialUpside);
    } else if (entry > 0 && target > 0) {
      pct = ((target - entry) / entry) * 100;
    }

    if (pct === undefined && (entry === 0 || target === 0)) {
      return null;
    }

    const calculatedPct = pct ?? 0;
    const diff = target > 0 && entry > 0 ? target - entry : (entry * calculatedPct) / 100;
    const val = diff * qty;
    const isProfit = calculatedPct >= 0;
    const capital = entry > 0 ? entry * qty : 0;

    return {
      value: val,
      percentage: calculatedPct,
      isProfit,
      returnAmnt: formatCurrency(val),
      returnPct: `${calculatedPct >= 0 ? '+' : ''}${calculatedPct.toFixed(2)}%`,
      qty,
      capital,
    };
  })();

  return (
    <article className="position-card">
      <div className="position-top">
        <ScripLogo
          size="md"
          symbol={stock.symbol}
          name={stock.name}
          logo={stock.logo}
          logolarge={stock.logolarge}
          logoLarge={stock.logoLarge}
          source={stock.source}
        />
        <div className="position-name">
          <strong
            className="cursor-pointer select-none transition-colors hover:text-[#ff7a3d]"
            onClick={handleCopySymbol}
            title="Click to copy symbol"
          >
            {stock.title}
            {copied ? (
              <Check size={15} className="text-[#ff7a3d]" />
            ) : (
              <Copy size={15} />
            )}
          </strong>
          <span>{stock.subtitle}</span>
        </div>

        {/* Badges: BUY, Horizon/Duration, Research Report (before source), Source badge */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Badge variant="brand" className="font-semibold uppercase tracking-wider">
            BUY
          </Badge>
          {horizonOrDuration && (
            <span className="rounded-md border border-[#3a352c] bg-[#1a1713] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#d4daf0]">
              {horizonOrDuration}
            </span>
          )}
          {stock.reportLink && (
            <a
              href={stock.reportLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View Research Report"
              aria-label="View Research Report"
              className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md border border-[#ff7a3d]/40 bg-[#2a170e] text-[#ffaa75] transition-colors hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/25 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
            </a>
          )}
          <span className={`source-badge !ml-0 ${stock.source}`}>
            {stock.source === 'liquide' ? 'LIQUIDE' : 'COINBASE'}
          </span>
        </div>
      </div>

      {/* Main Parameters Box: Entry Range (left) & Target | Stop Loss | Rec/Entry Price (right) */}
      <div className="mx-[22px] mb-2.5 rounded-[17px] border border-[#1e1a14] bg-[rgba(6,4,2,.45)] p-3.5">
        <div className="grid grid-cols-2 divide-x divide-[#282420]">
          {/* Left: Entry Range + Advice Date (Liquide) or Entry Time (Coinbase) */}
          <div className="flex flex-col items-center justify-center text-center pr-3">
            <span className="text-[12px] sm:text-[13px] font-medium text-[#aab5c9]">
              Entry Range
            </span>
            <strong className="mt-1.5 mb-1 font-mono text-[16px] sm:text-[18px] font-bold text-[#f5f6f9] tracking-tight">
              {entryRangeDisplay}
            </strong>
            {entrySubDetail && (
              <small className="text-[11px] sm:text-[12px] text-[#9aa5ba]">
                {entrySubDetail}
              </small>
            )}
          </div>

          {/* Right: Target & Stop Loss + Entry Price */}
          <div className="flex flex-col justify-center pl-3">
            <div className="grid grid-cols-2 divide-x divide-[#262420] pb-1.5">
              <div className="pr-2 flex flex-col items-center text-center">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa] whitespace-nowrap">
                  Target
                </span>
                <span className="mt-0.5 font-mono text-[13px] sm:text-[14px] font-bold text-[#34d399] whitespace-nowrap">
                  {targetDisplay}
                </span>
              </div>
              <div className="pl-2 flex flex-col items-center text-center">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa] whitespace-nowrap">
                  Stop Loss
                </span>
                <span className="mt-0.5 font-mono text-[13px] sm:text-[14px] font-bold text-[#f87171] whitespace-nowrap">
                  {stopLossDisplay}
                </span>
              </div>
            </div>

            {bottomPriceInfo && (
              <div className="border-t border-[#262420] pt-1.5 text-center flex items-center justify-center gap-1.5 text-[11px]">
                <span className="text-[#8a95aa] uppercase tracking-wider text-[10px]">
                  {bottomPriceInfo.label}:
                </span>
                <span className="font-mono font-bold text-[#ffaa75]">
                  {bottomPriceInfo.value}
                </span>
                {bottomPriceInfo.extra && (
                  <span className="text-[#8a95aa] font-medium ml-1">
                    · {bottomPriceInfo.extra}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Potential Upside Metric Card (Alike Options Potential Return) */}
      {returnMetric && (
        <div className="mx-[22px] mb-2.5 rounded-[14px] border border-[#272420] bg-[#14120e] p-3.5 sm:p-4">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa] mb-1">
              Potential Upside
            </span>
            <div
              className={`flex items-center gap-1.5 font-mono font-bold ${
                returnMetric.isProfit ? 'text-[#34d399]' : 'text-[#f87171]'
              }`}
            >
              {returnMetric.isProfit ? (
                <ArrowUpRight className="h-6 w-6 shrink-0 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-6 w-6 shrink-0 stroke-[2.5]" />
              )}
              {returnMetric.value !== 0 && (
                <span className="text-[20px] sm:text-[22px] font-extrabold tracking-tight">
                  {returnMetric.returnAmnt}
                </span>
              )}
              <span className="text-[15px] sm:text-[17px] font-semibold opacity-95">
                ({returnMetric.returnPct})
              </span>
              <span className="text-[12px] font-medium text-[#8a95aa]">
                {returnMetric.qty > 1 ? `/ ${returnMetric.qty} Qty` : '/ share'}
              </span>
            </div>

            {/* Required Capital */}
            {returnMetric.capital > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-[#9aa5ba]">
                <Wallet className="h-3.5 w-3.5 text-[#ff7a3d]" />
                <span className="font-mono font-semibold text-[#f5f6f9]">
                  {formatPrice(returnMetric.capital)}
                </span>
                <span className="text-[11px] text-[#8a95aa]">Required Capital</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="card-actions stock-actions">
        <Button
          variant="outline"
          className="w-full gap-2 border-[#222018] bg-[#101010] text-[#d6dbe7] hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/10 hover:text-[#ff7a3d]"
          onClick={handleExecute}
          disabled={executing}
        >
          <Zap className="h-4 w-4 text-[#ff7a3d]" />
          <span>{executing ? 'Executing...' : 'Execute Stock Order'}</span>
        </Button>
      </div>
    </article>
  );
}

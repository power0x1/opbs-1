import { useState } from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { ClosedOptionPosition } from '@/types';
import { formatDateTime, formatPrice, formatPercent, formatCurrency } from '@/utils/format';

interface ClosedOptionCardProps {
  position: ClosedOptionPosition;
  onAction?: (message: string) => void;
}

interface TargetItemDisplay {
  name: string;
  targetPrice: number;
  isHit: boolean;
  hitTimestamp?: string;
}

export function ClosedOptionCard({ position, onAction }: ClosedOptionCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopySymbol() {
    navigator.clipboard?.writeText(position.title || position.symbol);
    setCopied(true);
    onAction?.(`Copied ${position.title || position.symbol} to clipboard`);
    setTimeout(() => setCopied(false), 1500);
  }

  const isLiquide = position.source === 'liquide';
  const isCoinbase = position.source === 'coinbase';

  // Realized profit & returns
  const returnsObj = position.returns;
  const isProfit =
    returnsObj?.isProfit !== undefined
      ? returnsObj.isProfit
      : position.tone === 'win' || position.pnlValue >= 0;

  // Entry Price (liquide: use entryPrice, not entry zone)
  const entryPriceDisplay =
    position.entryPriceText ||
    (position.entryPrice ? formatPrice(position.entryPrice) : position.entry);

  // Timestamps under entry and exit
  const entryTimeDisplay =
    position.entryTimeText ||
    (position.entryTime ? formatDateTime(position.entryTime) : undefined) ||
    (position.EntryTime ? formatDateTime(position.EntryTime) : '—');

  const exitPriceDisplay = position.exitPriceText || position.exit || '—';

  const exitTimeDisplay =
    position.exitTimeText ||
    (position.exitDate ? formatDateTime(position.exitDate) : undefined) ||
    (position.exitTime ? formatDateTime(position.exitTime) : undefined) ||
    (position.ExitTime ? formatDateTime(position.ExitTime) : '—');

  // Coinbase specific values
  const coinbaseEntryDisplay = position.entryPriceText || position.iPricesText || position.entry || '—';
  const coinbaseExitDisplay = position.exitPriceText || position.ePricesText || position.exit || '—';

  // Target & Stop Loss displays
  const targetDisplay =
    position.targetPriceText ||
    (position.targetPrice ? formatPrice(position.targetPrice) : '—');
  const stopLossDisplay =
    position.stopLossText ||
    (position.stopLossPrice ? formatPrice(position.stopLossPrice) : '—');

  // Risk:Reward Ratio
  let ratioDisplay = position.riskRewardRatio;
  if (!ratioDisplay) {
    const rawEntry = position.entryPrice || 0;
    const rawTarget = position.targetPrice || 0;
    const rawSl = position.stopLossPrice || 0;
    if (rawEntry > 0 && rawTarget > 0 && rawSl > 0) {
      const reward = Math.abs(rawTarget - rawEntry);
      const risk = Math.abs(rawEntry - rawSl);
      if (risk > 0) {
        ratioDisplay = `1 : ${(reward / risk).toFixed(1)}`;
      }
    }
  }
  if (!ratioDisplay) ratioDisplay = '1 : 2.0';

  const rawEntry = position.entryPrice || 0;

  // Multi-target list: T1, T2, T3 (horizontal)
  const targetsList: TargetItemDisplay[] = [];

  if (position.multiTargetList && position.multiTargetList.length > 0) {
    position.multiTargetList.forEach((item, idx) => {
      const isHit =
        Boolean(item.targetHit) ||
        (position.currentTargetIndex !== undefined && position.currentTargetIndex >= idx);

      let hitTimestamp: string | undefined = undefined;
      const rawDate = item.targetHitDate;

      // Only show timestamp if target is hit and date is valid (null removed)
      if (isHit) {
        if (rawDate && String(rawDate).toLowerCase() !== 'null' && String(rawDate).trim() !== '') {
          hitTimestamp = formatDateTime(rawDate);
        } else if (exitTimeDisplay && exitTimeDisplay !== '—' && exitTimeDisplay !== 'null') {
          hitTimestamp = exitTimeDisplay;
        }
      }

      targetsList.push({
        name: `T${idx + 1}`,
        targetPrice: item.target || 0,
        isHit,
        hitTimestamp,
      });
    });
  } else {
    // Single target fallback
    const tPrice = position.targetPrice || 0;
    targetsList.push({
      name: 'T1',
      targetPrice: tPrice,
      isHit: true,
      hitTimestamp:
        exitTimeDisplay && exitTimeDisplay !== '—' && exitTimeDisplay !== 'null'
          ? exitTimeDisplay
          : undefined,
    });
  }

  // Returns row values
  const returnAmnt = returnsObj?.value !== undefined
    ? formatCurrency(returnsObj.value)
    : position.pnl;
  const returnPct = returnsObj?.percentage !== undefined
    ? formatPercent(returnsObj.percentage)
    : position.percent;

  // Determine exit type & stop loss status
  const isLoss =
    returnsObj?.isProfit === false ||
    position.tone === 'loss' ||
    (returnsObj?.value ?? position.pnlValue) < 0;

  const rawExitType = position.exitType || (isLoss ? 'STOP_LOSS' : 'TARGET_HIT');
  const exitTypeBadge = rawExitType.replace(/_/g, ' ').toUpperCase();

  const isStopLoss =
    exitTypeBadge.includes('STOP') ||
    exitTypeBadge.includes('SL') ||
    exitTypeBadge.includes('LOSS') ||
    (!position.exitType && isLoss);

  // Ensure "0 Lot (850 Qty)" displays as "1 Lot (850 Qty)"
  const subtitleDisplay = position.subtitle
    ? position.subtitle.replace(/\b0\s*Lot\b/gi, '1 Lot')
    : '';

  return (
    <article className="archive-card isolate">
      {/* Top Header */}
      <div className="position-top">
        <ScripLogo
          size="md"
          symbol={position.symbol}
          name={position.name}
          logo={position.logo}
          logolarge={position.logolarge}
          logoLarge={position.logoLarge}
          source={position.source}
        />
        <div className="position-name">
          <strong
            className="cursor-pointer select-none transition-colors hover:text-[#ff7a3d]"
            onClick={handleCopySymbol}
            title="Click to copy symbol"
          >
            {position.title}
            {copied ? (
              <Check size={15} className="text-[#ff7a3d]" />
            ) : (
              <Copy size={15} />
            )}
          </strong>
          <span>{subtitleDisplay}</span>
        </div>

        <div className="position-tags flex items-center gap-1.5 flex-wrap">
          {position.type && (
            <Badge variant="secondary" className="bg-[#242020] text-[#ccd4e2]">
              {position.type}
            </Badge>
          )}

          {isLiquide && position.isEarlyProfitAchieved && exitTypeBadge !== 'EARLY PROFIT' && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[#2f5532] bg-[#1a2d1d] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7de092]">
              <Sparkles size={11} /> Early Profit
            </span>
          )}

          <Badge
            variant={isStopLoss ? 'loss' : 'win'}
            className="font-semibold uppercase tracking-wider"
          >
            {exitTypeBadge}
          </Badge>
        </div>

        <span className={`source-badge ${position.source}`}>
          {isLiquide ? 'LIQUIDE' : 'COINBASE'}
        </span>
      </div>

      {/* Row 1: Entry Price & Exit Price with Timestamps (Entry items-start, Exit items-end) */}
      <div className="mx-[22px] mb-3 rounded-[17px] border border-[#292824] bg-[#202018] p-3.5">
        <div className="grid grid-cols-2 divide-x divide-[#282420]">
          {/* Entry: items-start */}
          <div className="flex flex-col items-start text-left pr-3">
            <span className="text-[12px] font-medium text-[#aab5c9]">
              {isLiquide ? 'Entry Price' : 'IPrices (Entry)'}
            </span>
            <strong className="mt-1.5 mb-1 font-mono text-[16px] font-bold text-[#f5f6f9]">
              {isLiquide ? entryPriceDisplay : coinbaseEntryDisplay}
            </strong>
            <small className="text-[12px] text-[#9aa5ba]">
              {entryTimeDisplay}
            </small>
          </div>

          {/* Exit: items-end */}
          <div className="flex flex-col items-end text-right pl-3">
            <span className="text-[12px] font-medium text-[#aab5c9]">
              {isLiquide ? 'Exit Price' : 'EPrices (Exit)'}
            </span>
            <strong
              className={`mt-1.5 mb-1 font-mono text-[16px] font-bold ${
                isProfit ? 'text-[#34d399]' : 'text-[#f87171]'
              }`}
            >
              {isLiquide ? exitPriceDisplay : coinbaseExitDisplay}
            </strong>
            <small
              className={`text-[12px] ${
                isProfit ? 'text-[#ff7a3d]' : 'text-[#ff6576]'
              }`}
            >
              {exitTimeDisplay}
            </small>
          </div>
        </div>
      </div>

      {/* Row 2: Returns Card (Centered, matching Image 2) */}
      <div className="mx-[22px] mb-2.5 rounded-[14px] border border-[#272420] bg-[#14120e] p-3.5 sm:p-4">
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center gap-1.5 font-mono font-bold ${
              isProfit ? 'text-[#34d399]' : 'text-[#f87171]'
            }`}
          >
            {isProfit ? (
              <ArrowUpRight className="h-6 w-6 shrink-0 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="h-6 w-6 shrink-0 stroke-[2.5]" />
            )}
            <span className="text-[20px] sm:text-[22px] font-extrabold tracking-tight">
              {returnAmnt}
            </span>
            <span className="text-[15px] sm:text-[17px] font-semibold opacity-95">
              ({returnPct})
            </span>
            <span className="text-[12px] font-medium text-[#8a95aa]">
              / lot
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Horizontal Multi-Target Card: Circled tick, T* and progress connector line (hidden for stoploss) */}
      {!isStopLoss && targetsList.length > 0 && (
        <div className="mx-[22px] mb-2.5 rounded-[14px] border border-[#272420] bg-[#14120e] p-3.5">
        <div
          className={`grid gap-2 ${
            targetsList.length === 1
              ? 'grid-cols-1'
              : targetsList.length === 2
              ? 'grid-cols-2'
              : targetsList.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-4'
          }`}
        >
          {targetsList.map((tgt, idx) => {
            const isHit = tgt.isHit;
            const nextTgt = targetsList[idx + 1];
            const isLast = idx === targetsList.length - 1;
            const tPrice = tgt.targetPrice;
            const gainPct =
              rawEntry > 0 && tPrice > 0 ? ((tPrice - rawEntry) / rawEntry) * 100 : 0;
            const gainPctStr =
              gainPct !== 0 ? `(${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%)` : '';

            // Connection line to next target:
            // Solid green if both current and next are hit
            // Dashed green if current is hit and next is pending
            // Dashed muted if neither is hit
            const isSolid = isHit && Boolean(nextTgt?.isHit);
            const isGreenDashed = isHit && Boolean(nextTgt && !nextTgt.isHit);

            return (
              <div
                key={idx}
                className={`relative flex flex-col ${
                  idx > 0 ? 'pl-2.5 sm:pl-3' : ''
                } ${idx < targetsList.length - 1 ? 'pr-2' : ''}`}
              >
                {/* Line 1: Circled tick, T* and connector line to next target */}
                <div className="relative flex items-center justify-between h-5">
                  <div className="relative z-10 flex items-center gap-1.5 font-mono text-[14px] font-bold bg-[#14120e] pr-2">
                    {isHit ? (
                      <CheckCircle2 className="h-4 w-4 text-[#34d399] shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-[#556075] shrink-0" />
                    )}
                    <span className={isHit ? 'text-[#f5f6f9]' : 'text-[#8a95aa]'}>
                      {tgt.name}
                    </span>
                  </div>

                  {/* Connecting line between targets */}
                  {!isLast && (
                    <div
                      className={`absolute left-0 right-[-10px] sm:right-[-14px] top-1/2 -translate-y-1/2 z-0 ${
                        isSolid
                          ? 'border-t-2 border-[#34d399] border-solid'
                          : isGreenDashed
                          ? 'border-t-2 border-[#34d399] border-dashed'
                          : 'border-t-2 border-[#3d4554] border-dashed'
                      }`}
                    />
                  )}
                </div>

                {/* Line 2: ₹41.50(+7.8%) */}
                <div className="mt-1 font-mono text-[11.5px] font-semibold text-[#f5f6f9] whitespace-nowrap">
                  <span>{tPrice > 0 ? formatPrice(tPrice) : '—'}</span>
                  {gainPctStr && (
                    <span className={`ml-1 ${isHit ? 'text-[#34d399]' : 'text-[#8a95aa]'}`}>
                      {gainPctStr}
                    </span>
                  )}
                </div>

                {/* Line 3: Timestamp (null removed - only shown if hit and timestamp exists) */}
                {isHit && tgt.hitTimestamp && tgt.hitTimestamp !== 'null' && tgt.hitTimestamp !== '—' && (
                  <div className="mt-1 text-[10px] leading-tight text-[#8a95aa]">
                    {tgt.hitTimestamp}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Row 4: Target | Stop Loss at Bottom ("Ratio" text removed) */}
      <div className="mx-[22px] mb-3 rounded-[14px] border border-[#272420] bg-[#14120e] p-3">
        <div className="grid grid-cols-2 divide-x divide-[#262420] pb-2">
          <div className="pr-3 flex flex-col items-start sm:items-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa]">
              Target
            </span>
            <span className="mt-0.5 font-mono text-[14px] font-bold text-[#34d399]">
              {targetDisplay}
            </span>
          </div>
          <div className="pl-3 flex flex-col items-end sm:items-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa]">
              Stop Loss
            </span>
            <span className="mt-0.5 font-mono text-[14px] font-bold text-[#f87171]">
              {stopLossDisplay}
            </span>
          </div>
        </div>
        <div className="border-t border-[#262420] pt-2 text-center">
          <span className="font-mono text-[12px] font-bold text-[#ffaa75]">
            {ratioDisplay}
          </span>
        </div>
      </div>

      {/* Lot size for Coinbase if available */}
      {isCoinbase && position.Quantity !== undefined && (
        <div className="advised flex items-center justify-end text-[11px] text-[#8a95aa] pb-3 px-[22px]">
          <span>Lot size: {position.Quantity} Qty/lot</span>
        </div>
      )}
    </article>
  );
}

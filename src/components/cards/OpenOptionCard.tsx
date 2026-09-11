import { useState } from 'react';
import { Copy, Zap, Check, Target, CheckCircle2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { OpenOptionPosition } from '@/types';
import { createPosition } from '@/services';
import { formatPrice, formatDateTime, formatCurrency, formatPercent } from '@/utils/format';

interface OpenOptionCardProps {
  position: OpenOptionPosition;
  onAction: (message: string) => void;
}

export function OpenOptionCard({ position, onAction }: OpenOptionCardProps) {
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleExecute() {
    setExecuting(true);
    try {
      await createPosition({
        symbol: position.symbol,
        name: position.name,
        optionType: position.type,
        entryPrice: parseFloat(position.entry.replace(/[^0-9.-]/g, '')) || 100,
        quantity: 50,
        status: 'open',
        source: position.source,
      });
      onAction(`${position.title} executed successfully`);
    } catch {
      onAction('Failed to execute position');
    } finally {
      setExecuting(false);
    }
  }

  function handleCopySymbol() {
    navigator.clipboard?.writeText(position.title || position.symbol);
    setCopied(true);
    onAction(`Copied ${position.title || position.symbol} to clipboard`);
    setTimeout(() => setCopied(false), 1500);
  }

  // Derive target & stop loss values across providers
  const targetDisplay = position.targetPriceText ||
    (position.target && position.target > 0 ? formatPrice(position.target) : '—');

  const stopLossDisplay = position.stopLossText ||
    (position.sl && position.sl > 0 ? formatPrice(position.sl) : '—');

  const entryDisplay = position.entryRangeText || position.entry || '—';

  // Subtitle format: e.g. "IEX · 1 lot (4350 Qty)"
  const subtitleDisplay = (() => {
    if (!position.subtitle) return '';
    let sub = position.subtitle;
    if (/·\s*(\d+)\s*Qty/i.test(sub) && !/lot/i.test(sub)) {
      sub = sub.replace(/·\s*(\d+)\s*Qty/i, '· 1 lot ($1 Qty)');
    }
    sub = sub.replace(/\b(\d+)\s*Lot\b/g, '$1 lot');
    sub = sub.replace(/\b0\s*lot\b/gi, '1 lot');
    return sub;
  })();

  // Calculate Risk:Reward Ratio (matching Image 2)
  let ratioDisplay = position.riskRewardRatio;
  if (!ratioDisplay) {
    const rawEntry =
      position.recommendedPrice1 ||
      position.recommendedPrice ||
      position.entryStartPrice ||
      parseFloat(position.entry.replace(/[^0-9.-]/g, '')) ||
      0;
    const rawTarget = position.target || position.targetPrice || 0;
    const rawSl = position.sl || position.stopLossPrice || 0;
    if (rawEntry > 0 && rawTarget > 0 && rawSl > 0) {
      const reward = Math.abs(rawTarget - rawEntry);
      const risk = Math.abs(rawEntry - rawSl);
      if (risk > 0) {
        ratioDisplay = `1 : ${(reward / risk).toFixed(1)}`;
      }
    }
  }
  if (!ratioDisplay) ratioDisplay = '1 : 2.0';

  // Timestamps under entry (Line 1: Entry Range, Line 2: price range, Line 3: time)
  const entryTimeDisplay =
    position.entryTimeText ||
    (position.entryTime ? formatDateTime(position.entryTime) : undefined) ||
    '11 Sept 26, 09:40 am';

  // Centered Potential Return Metric (matching Closed Options)
  // coinbase -> iPrice , target
  // liquide -> entryPrice, targetPrice
  const returnMetric = (() => {
    if (position.returnMetric) {
      return position.returnMetric;
    }

    let entry = 0;
    let target = 0;
    let qty = 1;

    if (position.source === 'coinbase') {
      entry =
        position.iPrice ||
        position.recommendedPrice1 ||
        parseFloat(position.entry.replace(/[^0-9.-]/g, '')) ||
        0;
      target = position.target || position.targetPrice || 0;
      const subtitleQty = position.subtitle?.match(/(\d+)\s*Qty/i);
      qty = position.quantity || (subtitleQty ? parseInt(subtitleQty[1], 10) : 1);
    } else {
      // liquide: entryPrice, targetPrice
      entry =
        position.entryPrice ||
        position.recommendedPrice ||
        position.entryStartPrice ||
        parseFloat(position.entry.replace(/[^0-9.-]/g, '')) ||
        0;
      target =
        position.targetPrice ||
        (position.multiTargetList && position.multiTargetList[0]?.target) ||
        0;
      const subtitleQty = position.subtitle?.match(/(\d+)\s*Qty/i);
      qty = position.lotSize || (subtitleQty ? parseInt(subtitleQty[1], 10) : 1);
    }

    if (entry > 0 && target > 0) {
      const diff = target - entry;
      const pct = (diff / entry) * 100;
      const val = diff * qty;
      const isProfit = val >= 0;
      return {
        value: val,
        percentage: pct,
        isProfit,
        returnAmnt: formatCurrency(val),
        returnPct: formatPercent(pct),
      };
    }

    if (position.potentialReturns) {
      const val = position.potentialReturns.value ?? 0;
      const pct = position.potentialReturns.percentage ?? 0;
      const isProfit = val >= 0;
      return {
        value: val,
        percentage: pct,
        isProfit,
        returnAmnt: formatCurrency(val),
        returnPct: formatPercent(pct),
      };
    }

    return null;
  })();

  // Subtle Required Capital: icon and number
  const requiredCapitalDisplay = (() => {
    if (position.requiredCapitalText) return position.requiredCapitalText;
    if (position.requiredCapital && position.requiredCapital > 0) {
      return formatCurrency(position.requiredCapital);
    }
    if (position.marginRequired && position.marginRequired > 0) {
      return formatCurrency(position.marginRequired);
    }
    let entryNum = 0;
    let qty = 1;
    if (position.source === 'coinbase') {
      entryNum = position.iPrice || position.recommendedPrice1 || 0;
      qty = position.quantity || 1;
    } else {
      entryNum = position.entryPrice || position.recommendedPrice || position.entryStartPrice || 0;
      qty = position.lotSize || 1;
    }
    if (!entryNum) {
      entryNum = parseFloat(position.entry.replace(/[^0-9.-]/g, '')) || 0;
    }
    if (entryNum > 0 && qty > 0) {
      return formatCurrency(entryNum * qty);
    }
    return null;
  })();

  return (
    <article className="position-card">
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
        <div className="position-tags">
          <Badge variant="brand" className="font-semibold uppercase tracking-wider">BUY</Badge>
          <Badge variant="secondary" className="bg-[#242020] text-[#ccd4e2]">{position.type}</Badge>
        </div>
        <span className={`source-badge ${position.source}`}>
          {position.source === 'liquide' ? 'LIQUIDE' : 'COINBASE'}
        </span>
      </div>

      {/* Row 1: Entry Range (left, centered with bigger font) & Target | Stop Loss | Ratio (right) */}
      <div className="mx-[22px] mb-2.5 rounded-[17px] border border-[#1e1a14] bg-[rgba(6,4,2,.45)] p-3.5">
        <div className="grid grid-cols-2 divide-x divide-[#282420]">
          {/* Entry Range: left (Line 1: Label, Line 2: Price range, Line 3: Time) - Centered with bigger fonts */}
          <div className="flex flex-col items-center justify-center text-center pr-3">
            <span className="text-[12px] sm:text-[13px] font-medium text-[#aab5c9]">
              {position.source === 'liquide' ? 'Entry Zone' : 'Entry Range'}
            </span>
            <strong className="mt-1.5 mb-1 font-mono text-[17px] sm:text-[19px] font-bold text-[#f5f6f9] tracking-tight">
              {entryDisplay}
            </strong>
            <small className="text-[12px] sm:text-[13px] text-[#9aa5ba]">
              {entryTimeDisplay}
            </small>
          </div>

          {/* Target | Stop Loss & Risk:Reward Ratio: right */}
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
            <div className="border-t border-[#262420] pt-1.5 text-center">
              <span className="font-mono text-[11px] sm:text-[12px] font-bold text-[#ffaa75]">
                {ratioDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Potential Return Metric Card (Centered) with subtle Required Capital */}
      {returnMetric && (
        <div className="mx-[22px] mb-2.5 rounded-[14px] border border-[#272420] bg-[#14120e] p-3.5 sm:p-4">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a95aa] mb-1">
              Potential Return
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
              <span className="text-[20px] sm:text-[22px] font-extrabold tracking-tight">
                {returnMetric.returnAmnt}
              </span>
              <span className="text-[15px] sm:text-[17px] font-semibold opacity-95">
                ({returnMetric.returnPct})
              </span>
              <span className="text-[12px] font-medium text-[#8a95aa]">
                / lot
              </span>
            </div>

            {/* Required Capital (Subtle: icon and number) */}
            {requiredCapitalDisplay && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-[#9aa5ba]">
                <Wallet className="h-3.5 w-3.5 text-[#ff7a3d]" />
                <span className="font-mono font-semibold text-[#f5f6f9]">
                  {requiredCapitalDisplay}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 2: Multi-Target Milestone Track (Liquide / fno_trades/active) */}
      {position.multiTargetList && position.multiTargetList.length > 0 && (
        <div className="mx-[22px] mb-2.5 rounded-[16px] border border-[#272420] bg-[#14120e] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#aab5c9]">
              <Target className="h-3.5 w-3.5 text-[#ff7a3d]" />
              Target Milestones ({position.multiTargetList.length})
            </span>
            <span className="text-[11px] font-medium text-[#8a95aa]">
              {position.multiTargetList.filter((t) => t.targetHit).length} of {position.multiTargetList.length} hit
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {position.multiTargetList.map((targetItem, idx) => {
              const isHit = targetItem.targetHit;
              const isCurrent = position.currentTargetIndex === idx;
              return (
                <div
                  key={idx}
                  className={`flex flex-col justify-between rounded-xl border p-2 transition-colors ${
                    isHit
                      ? 'border-[#8a4520] bg-[#3a1f12]/60 text-[#ff7a3d]'
                      : isCurrent
                      ? 'border-[#ff7a3d]/50 bg-[#251912] text-[#f5f6f9]'
                      : 'border-[#262420] bg-[#1a1714] text-[#ccd4e2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#8a95aa]">
                      T{idx + 1}
                    </span>
                    {isHit ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff7a3d]">
                        <CheckCircle2 className="h-3 w-3" /> Hit
                      </span>
                    ) : isCurrent ? (
                      <span className="rounded bg-[#ff7a3d]/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#ffaa75]">
                        Active
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#6b7280]">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className="mt-1 font-mono text-[13px] font-semibold tracking-tight text-[#f5f6f9]">
                    {formatPrice(targetItem.target)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card-actions">
        <Button
          variant="outline"
          className="w-full gap-2 border-[#222018] bg-[#101010] text-[#d6dbe7] hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/10 hover:text-[#ff7a3d]"
          onClick={handleExecute}
          disabled={executing}
        >
          <Zap className="h-4 w-4 text-[#ff7a3d]" />
          <span>{executing ? 'Executing...' : 'Execute Trade'}</span>
        </Button>
      </div>
    </article>
  );
}

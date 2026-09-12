import type { FnoTrade, CoinbaseTrade, ActiveTrade, Position } from '@/types/trade';
import type {
  OpenOptionPosition,
  ClosedOptionPosition,
  StockPosition,
  PositionRow,
  WatchItem,
  PortfolioSummary,
  AnalysisDayRow,
} from '@/types';
import { formatCurrency, formatPrice, formatPercent, pnlTone, tickerFromSymbol, formatPrices, formatDateTime } from '@/utils/format';

function safeFnoScrip(trade: FnoTrade) {
  return (
    trade.scrip ?? {
      symbol: trade.equityScrip?.symbol ?? 'UNKNOWN',
      shortSymbol: '',
      expiryDate: '',
      lotSize: 0,
      lotSizeNum: 0,
      parentScrip: '',
      status: '',
      _id: '',
    }
  );
}

function fnoInvested(trade: FnoTrade): number {
  const price = trade.recommendedPrice ?? 0;
  const qty = trade.lotSize ?? 0;
  return price * qty;
}

function coinbaseInvested(trade: CoinbaseTrade): number {
  const price = trade.iPrice || trade.recommendedPrice1 || 0;
  const qty = trade.quantity ?? 0;
  return price * qty;
}

function activeTradeInvested(trade: ActiveTrade): number {
  return trade.investedValue ?? 0;
}

function formatFnoEntryRange(trade: FnoTrade): string {
  const start = trade.entryStartPrice ?? 0;
  const end = trade.entryEndPrice ?? 0;
  const rec = trade.recommendedPrice ?? 0;

  if (start > 0 && end > 0) {
    if (start === end) return formatPrice(start);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  }
  if (start > 0) return formatPrice(start);
  if (end > 0) return formatPrice(end);
  if (rec > 0) return formatPrice(rec);
  return '—';
}

function formatCoinbaseEntryRange(trade: CoinbaseTrade): string {
  const p1 = trade.recommendedPrice1 ?? 0;
  const p2 = trade.recommendedPrice2 ?? 0;
  const iPrice = trade.iPrice || trade.entryPrice || 0;

  if (p1 > 0 && p2 > 0) {
    if (p1 === p2) return formatPrice(p1);
    const min = Math.min(p1, p2);
    const max = Math.max(p1, p2);
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  }
  if (p1 > 0) return formatPrice(p1);
  if (p2 > 0) return formatPrice(p2);
  if (iPrice > 0) return formatPrice(iPrice);
  return '—';
}

function fnoToOpenOption(trade: FnoTrade): OpenOptionPosition {
  const scrip = safeFnoScrip(trade);
  const pnl = trade.potentialReturns?.value ?? 0;
  const percent = trade.potentialReturns?.percentage ?? 0;
  const entryRangeText = formatFnoEntryRange(trade);
  const stopLossText = trade.stopLossPrice && trade.stopLossPrice > 0 ? formatPrice(trade.stopLossPrice) : undefined;
  const targetPriceText = trade.targetPrice && trade.targetPrice > 0 ? formatPrice(trade.targetPrice) : undefined;
  const lotCount = trade.recommendedLotSize && trade.recommendedLotSize > 0 ? trade.recommendedLotSize : 1;

  const entryTime = trade.advisedAt || trade.recommendedAt;
  const entryTimeText = entryTime ? formatDateTime(entryTime) : undefined;

  const entryPrice = trade.entryPrice ?? trade.recommendedPrice ?? trade.entryStartPrice ?? 0;
  const targetPrice = trade.targetPrice || (trade.multiTargetList?.[0]?.target) || 0;
  const rawSl = trade.stopLossPrice || 0;
  let riskRewardRatio: string | undefined;
  if (entryPrice > 0 && targetPrice > 0 && rawSl > 0) {
    const reward = Math.abs(targetPrice - entryPrice);
    const risk = Math.abs(entryPrice - rawSl);
    if (risk > 0) {
      riskRewardRatio = `1 : ${(reward / risk).toFixed(1)}`;
    }
  }

  // Liquide: Return metric from entryPrice to targetPrice (per lot)
  const lotSize = trade.lotSize ?? (trade.equityScrip as { lotSize?: number })?.lotSize ?? 1;
  let liquideReturnVal = 0;
  let liquideReturnPct = 0;
  let liquideHasReturn = false;

  if (entryPrice > 0 && targetPrice > 0) {
    const diff = targetPrice - entryPrice;
    liquideReturnPct = (diff / entryPrice) * 100;
    liquideReturnVal = diff * lotSize;
    liquideHasReturn = true;
  } else if (trade.potentialReturns) {
    liquideReturnVal = trade.potentialReturns.value ?? 0;
    liquideReturnPct = trade.potentialReturns.percentage ?? 0;
    liquideHasReturn = true;
  }

  const liquideIsProfit = liquideReturnVal >= 0;
  const returnMetric = liquideHasReturn ? {
    value: liquideReturnVal,
    percentage: liquideReturnPct,
    isProfit: liquideIsProfit,
    returnAmnt: formatCurrency(liquideReturnVal),
    returnPct: formatPercent(liquideReturnPct),
  } : undefined;

  const requiredCapital = entryPrice > 0 ? entryPrice * lotSize : (trade.entryStartPrice || 0) * lotSize;
  const requiredCapitalText = requiredCapital > 0 ? formatCurrency(requiredCapital) : undefined;

  return {
    id: trade._id,
    ticker: tickerFromSymbol(scrip.symbol),
    title: scrip.symbol,
    symbol: scrip.symbol,
    name: trade.equityScrip?.name ?? 'Unknown',
    logo: trade.equityScrip?.logo,
    logolarge: trade.equityScrip?.logolarge,
    logoLarge: trade.equityScrip?.logoLarge,
    subtitle: `${trade.equityScrip?.name ?? 'Unknown'} · ${lotCount} lot (${trade.lotSize ?? 0} Qty)`,
    entry: entryRangeText,
    entryRangeText,
    entryStartPrice: trade.entryStartPrice,
    entryEndPrice: trade.entryEndPrice,
    entryPrice,
    lotSize,
    recommendedPrice: trade.recommendedPrice,
    stopLossPrice: trade.stopLossPrice,
    targetPrice: trade.targetPrice,
    stopLossText,
    targetPriceText,
    entryTime,
    entryTimeText,
    riskRewardRatio,
    returnMetric,
    requiredCapital,
    requiredCapitalText,
    ltp: formatPrice(trade.entryEndPrice || trade.recommendedPrice || 0),
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    type: trade.optionType ?? 'CE',
    pnlValue: pnl,
    invested: fnoInvested(trade),
    source: 'liquide',
    multiTargetList: trade.multiTargetList ?? [],
    currentTargetIndex: trade.currentTargetIndex,
    potentialReturns: trade.potentialReturns,
    potentialReturnsFormatted: trade.potentialReturns
      ? {
          value: formatCurrency(trade.potentialReturns.value ?? 0),
          percentage: formatPercent(trade.potentialReturns.percentage ?? 0),
        }
      : undefined,
  };
}

function fnoToClosedOption(trade: FnoTrade): ClosedOptionPosition {
  const scrip = safeFnoScrip(trade);
  const returnsObj = trade.returns || (trade.potentialReturns ? {
    isProfit: (trade.potentialReturns.value ?? 0) >= 0,
    percentage: trade.potentialReturns.percentage ?? 0,
    value: trade.potentialReturns.value ?? 0,
  } : undefined);

  const rawPnl = returnsObj?.value ?? trade.potentialReturns?.value ?? 0;
  const rawPercent = returnsObj?.percentage ?? trade.potentialReturns?.percentage ?? 0;
  const isProfit = returnsObj?.isProfit !== undefined ? returnsObj.isProfit : rawPnl >= 0;
  const pnl = isProfit ? Math.abs(rawPnl) : -Math.abs(rawPnl);
  const percent = isProfit ? Math.abs(rawPercent) : -Math.abs(rawPercent);
  const tone = isProfit ? 'win' : 'loss';

  const entryRangeText = formatFnoEntryRange(trade);
  // Entry price: for closed card use entryPrice (liquide) not entry zone
  const rawEntryPrice = trade.entryPrice ?? trade.recommendedPrice ?? trade.entryStartPrice ?? 0;
  const entryPriceText = rawEntryPrice > 0 ? formatPrice(rawEntryPrice) : entryRangeText;

  const exitPriceVal = trade.exitPrice ?? trade.entryEndPrice ?? 0;
  const exitText = exitPriceVal > 0 ? formatPrice(exitPriceVal) : '—';
  const exitPriceText = trade.exitPrice ? formatPrice(trade.exitPrice) : (exitPriceVal > 0 ? formatPrice(exitPriceVal) : undefined);

  // Timestamps
  const entryTime = trade.advisedAt || trade.recommendedAt;
  const entryTimeText = entryTime ? formatDateTime(entryTime) : undefined;
  const exitTime = trade.exitDate;
  const exitTimeText = exitTime ? formatDateTime(exitTime) : undefined;

  // Risk to reward ratio
  const targetPrice = trade.targetPrice || (trade.multiTargetList?.[0]?.target) || 0;
  const stopLossPrice = trade.stopLossPrice || 0;
  let riskRewardRatio: string | undefined;
  if (rawEntryPrice > 0 && targetPrice > 0 && stopLossPrice > 0) {
    const reward = Math.abs(targetPrice - rawEntryPrice);
    const risk = Math.abs(rawEntryPrice - stopLossPrice);
    if (risk > 0) {
      riskRewardRatio = `1 : ${(reward / risk).toFixed(1)}`;
    }
  }

  const lotCount = trade.recommendedLotSize && trade.recommendedLotSize > 0 ? trade.recommendedLotSize : 1;

  return {
    id: trade._id,
    ticker: tickerFromSymbol(scrip.symbol),
    title: scrip.symbol,
    symbol: scrip.symbol,
    name: trade.equityScrip?.name ?? 'Unknown',
    logo: trade.equityScrip?.logo,
    logolarge: trade.equityScrip?.logolarge,
    logoLarge: trade.equityScrip?.logoLarge,
    subtitle: `${trade.equityScrip?.name ?? 'Unknown'} · ${lotCount} Lot (${trade.lotSize ?? 0} Qty)`,
    entry: entryPriceText,
    entryRangeText,
    entryPrice: rawEntryPrice,
    entryPriceText,
    entryTime,
    entryTimeText,
    exit: exitText,
    exitTime,
    exitTimeText,
    type: trade.optionType ?? 'CE',
    lotSize: trade.lotSize,
    recommendedLotSize: trade.recommendedLotSize,

    // Liquide closed fields
    currentTargetIndex: trade.currentTargetIndex,
    exitDate: trade.exitDate,
    exitPrice: trade.exitPrice,
    exitPriceText,
    exitType: trade.exitType || (isProfit ? 'TARGET_HIT' : 'STOP_LOSS'),
    isEarlyProfitAchieved: trade.isEarlyProfitAchieved,
    partialProfitBookedAt: trade.partialProfitBookedAt,
    returns: returnsObj,
    multiTargetList: trade.multiTargetList,
    potentialReturns: trade.potentialReturns,

    stopLossPrice: trade.stopLossPrice,
    targetPrice: trade.targetPrice,
    stopLossText: trade.stopLossPrice && trade.stopLossPrice > 0 ? formatPrice(trade.stopLossPrice) : undefined,
    targetPriceText: trade.targetPrice && trade.targetPrice > 0 ? formatPrice(trade.targetPrice) : undefined,
    riskRewardRatio,
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    detail: trade.exitType ? trade.exitType.replace(/_/g, ' ') : 'Settled',
    tone,
    pnlValue: pnl,
    source: 'liquide',
  };
}

function coinbaseToOpenOption(trade: CoinbaseTrade): OpenOptionPosition {
  const pnl = trade.runtimePnl ?? 0;
  const entryVal = trade.iPrice || trade.recommendedPrice1 || trade.recommendedPrice2 || 0;
  const percent = entryVal > 0 ? (((trade.cPrice ?? 0) - entryVal) / entryVal) * 100 : 0;
  const entryRangeText = formatCoinbaseEntryRange(trade);
  const stopLossText = trade.sl && trade.sl > 0 ? formatPrice(trade.sl) : undefined;
  const targetPriceText = trade.target && trade.target > 0 ? formatPrice(trade.target) : undefined;

  const entryTime = trade.EntryTime || trade.entryTime || trade.createdAt;
  const entryTimeText = entryTime ? formatDateTime(entryTime) : undefined;

  const rawEntry = trade.recommendedPrice1 || trade.iPrice || 0;
  const rawTarget = trade.target || 0;
  const rawSl = trade.sl || 0;
  let riskRewardRatio: string | undefined;
  if (rawEntry > 0 && rawTarget > 0 && rawSl > 0) {
    const reward = Math.abs(rawTarget - rawEntry);
    const risk = Math.abs(rawEntry - rawSl);
    if (risk > 0) {
      riskRewardRatio = `1 : ${(reward / risk).toFixed(1)}`;
    }
  }

  // Coinbase: Return metric from iPrice to target (per lot / quantity)
  const iPrice = trade.iPrice || trade.recommendedPrice1 || trade.entryPrice || 0;
  const target = trade.target || 0;
  const quantity = trade.Quantity ?? trade.quantity ?? 1;

  let cbReturnVal = 0;
  let cbReturnPct = 0;
  let cbHasReturn = false;

  if (iPrice > 0 && target > 0) {
    const diff = target - iPrice;
    cbReturnPct = (diff / iPrice) * 100;
    cbReturnVal = diff * quantity;
    cbHasReturn = true;
  }

  const cbIsProfit = cbReturnVal >= 0;
  const cbReturnMetric = cbHasReturn ? {
    value: cbReturnVal,
    percentage: cbReturnPct,
    isProfit: cbIsProfit,
    returnAmnt: formatCurrency(cbReturnVal),
    returnPct: formatPercent(cbReturnPct),
  } : undefined;

  const rawQuantity = trade.quantity ?? trade.Quantity ?? 0;
  const lotCount = trade.lots || trade.recommendedLotSize || 1;
  const cbRequiredCapital = (trade.marginRequired && trade.marginRequired > 0)
    ? trade.marginRequired
    : (iPrice > 0 && quantity > 0 ? iPrice * quantity : 0);
  const cbRequiredCapitalText = cbRequiredCapital > 0 ? formatCurrency(cbRequiredCapital) : undefined;

  return {
    id: trade.callId,
    ticker: tickerFromSymbol(trade.symbol ?? ''),
    title: trade.symbol ?? '',
    symbol: trade.symbol ?? '',
    name: trade.name ?? 'Unknown',
    subtitle: `${trade.name ?? 'Unknown'} · ${lotCount} lot (${rawQuantity} Qty)`,
    entry: entryRangeText,
    entryRangeText,
    recommendedPrice1: trade.recommendedPrice1,
    recommendedPrice2: trade.recommendedPrice2,
    iPrice,
    quantity,
    sl: trade.sl,
    target: trade.target,
    stopLossPrice: trade.sl,
    targetPrice: trade.target,
    stopLossText,
    targetPriceText,
    entryTime,
    entryTimeText,
    riskRewardRatio,
    returnMetric: cbReturnMetric,
    marginRequired: trade.marginRequired,
    requiredCapital: cbRequiredCapital,
    requiredCapitalText: cbRequiredCapitalText,
    ltp: formatPrice(trade.cPrice ?? 0),
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    type: (trade.symbol ?? '').endsWith('C') ? 'CE' : 'PE',
    pnlValue: pnl,
    invested: coinbaseInvested(trade),
    source: 'coinbase',
  };
}

function coinbaseToClosedOption(trade: CoinbaseTrade): ClosedOptionPosition {
  const rawIp = trade.IPrices ?? trade.iPrice ?? trade.entryPrice ?? trade.recommendedPrice1 ?? 0;
  const rawEp = trade.EPrices ?? trade.exitPrice ?? 0;

  const iPricesText = formatPrices(rawIp);
  const ePricesText = formatPrices(rawEp);

  const entryVal = typeof rawIp === 'number'
    ? rawIp
    : (Array.isArray(rawIp) && rawIp.length > 0 ? Number(rawIp[0]) : (trade.iPrice || trade.entryPrice || 0));
  const exitVal = typeof rawEp === 'number'
    ? rawEp
    : (Array.isArray(rawEp) && rawEp.length > 0 ? Number(rawEp[0]) : (trade.exitPrice || 0));

  const rawQty = trade.Quantity ?? trade.quantity ?? 1;
  const computedPnl = entryVal > 0 && exitVal > 0 ? (exitVal - entryVal) * rawQty : 0;
  const pnl = trade.runtimePnl !== undefined ? trade.runtimePnl : computedPnl;
  const percent = entryVal > 0 && exitVal > 0 ? (((exitVal - entryVal) / entryVal) * 100) : 0;
  const entryRangeText = formatCoinbaseEntryRange(trade);

  const quantityPerLotText = trade.Quantity || trade.quantity ? `${rawQty} / Lot` : undefined;

  const entryTime = trade.EntryTime || trade.entryTime;
  const exitTime = trade.ExitTime || trade.exitTime;
  const entryTimeText = entryTime ? formatDateTime(entryTime) : undefined;
  const exitTimeText = exitTime ? formatDateTime(exitTime) : undefined;

  const cbTarget = trade.target || 0;
  const cbSl = trade.sl || 0;
  let cbRiskRewardRatio: string | undefined;
  if (entryVal > 0 && cbTarget > 0 && cbSl > 0) {
    const reward = Math.abs(cbTarget - entryVal);
    const risk = Math.abs(entryVal - cbSl);
    if (risk > 0) {
      cbRiskRewardRatio = `1 : ${(reward / risk).toFixed(1)}`;
    }
  }

  return {
    id: trade.callId,
    ticker: tickerFromSymbol(trade.symbol ?? ''),
    title: trade.symbol ?? '',
    symbol: trade.symbol ?? '',
    name: trade.name ?? 'Unknown',
    subtitle: `${trade.name ?? 'Unknown'}${rawQty ? ` · ${rawQty} / Lot` : ''}`,
    entry: iPricesText !== '—' ? iPricesText : entryRangeText,
    entryRangeText,
    entryPrice: entryVal,
    entryPriceText: iPricesText !== '—' ? iPricesText : formatPrice(entryVal),
    entryTime,
    entryTimeText,
    exit: ePricesText !== '—' ? ePricesText : formatPrice(exitVal),
    exitTime,
    exitTimeText,
    type: (trade.symbol ?? '').endsWith('C') ? 'CE' : 'PE',
    stopLossPrice: trade.sl,
    targetPrice: trade.target,
    stopLossText: trade.sl && trade.sl > 0 ? formatPrice(trade.sl) : undefined,
    targetPriceText: trade.target && trade.target > 0 ? formatPrice(trade.target) : undefined,
    riskRewardRatio: cbRiskRewardRatio,
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    detail: 'Settled',
    tone: pnlTone(pnl) as 'win' | 'loss',
    pnlValue: pnl,
    source: 'coinbase',
    exitType: pnl >= 0 ? 'TARGET_HIT' : 'STOP_LOSS',

    // Coinbase closed fields
    ExitTime: exitTime,
    EPrices: rawEp,
    IPrices: rawIp,
    EntryTime: entryTime,
    Quantity: rawQty,
    quantityPerLotText,
    ePricesText,
    iPricesText,
  };
}

export function mapOpenOptionPositions(
  fnoActiveTrades: FnoTrade[],
  coinbaseOptions: CoinbaseTrade[],
): OpenOptionPosition[] {
  const fromFno = fnoActiveTrades
    .filter((t) => t.status === 'active' || t.status === 'Live')
    .map(fnoToOpenOption);
  const fromCoinbase = coinbaseOptions
    .filter((t) => !t.exited && t.status !== 'closed' && t.status !== 'Exited')
    .map(coinbaseToOpenOption);
  return [...fromFno, ...fromCoinbase];
}

export function mapClosedOptionPositions(
  fnoClosedTrades: FnoTrade[],
  coinbaseOptions: CoinbaseTrade[],
): ClosedOptionPosition[] {
  const fromFno = fnoClosedTrades
    .filter((t) => t.status !== 'active' && t.status !== 'Live')
    .map(fnoToClosedOption);
  const fromCoinbase = coinbaseOptions
    .filter((t) => t.exited || t.status === 'closed' || t.status === 'Exited' || !!t.ExitTime || !!t.exitPrice || !!t.EPrices)
    .map(coinbaseToClosedOption);
  return [...fromFno, ...fromCoinbase];
}

function activeTradeToStockPosition(trade: ActiveTrade): StockPosition {
  const entryStart = trade.entryStartPrice ?? 0;
  const entryEnd = trade.entryEndPrice ?? 0;
  const entry = entryStart || entryEnd || trade.recommendedAt || 0;
  const ltp = entryEnd || entryStart || 0;
  const pnl = trade.investedValue > 0 && entry > 0 ? ((ltp - entry) / entry) * trade.investedValue : 0;
  const percent = entry > 0 ? ((ltp - entry) / entry) * 100 : 0;
  const tone = pnlTone(pnl) as 'win' | 'loss';
  const badge = trade.isTargetAchieved ? 'Target Hit' : (trade.stopLoss && trade.stopLoss > 0 ? `SL: ${formatPrice(trade.stopLoss)}` : 'Active');

  const entryRangeText = entryStart > 0 && entryEnd > 0
    ? `${formatPrice(entryStart)} - ${formatPrice(entryEnd)}`
    : (entryStart > 0 ? formatPrice(entryStart) : (entryEnd > 0 ? formatPrice(entryEnd) : formatPrice(entry)));

  const potentialUpside = trade.potentialUpside;
  const potentialUpsideText = potentialUpside !== undefined
    ? `${potentialUpside >= 0 ? '+' : ''}${Number(potentialUpside).toFixed(2)}%`
    : undefined;

  return {
    id: trade._id,
    ticker: tickerFromSymbol(trade.scrip?.symbol ?? 'UNKNOWN'),
    title: trade.scrip?.name ?? 'Unknown',
    symbol: trade.scrip?.symbol ?? 'UNKNOWN',
    name: trade.scrip?.name ?? 'Unknown',
    logo: trade.scrip?.logo,
    logolarge: trade.scrip?.logolarge,
    logoLarge: trade.scrip?.logoLarge,
    subtitle: `${trade.scrip?.name ?? 'Unknown'} · Equity · ${trade.recommendedQty ?? 0} Qty`,
    entry: formatPrice(entry),
    ltp: formatPrice(ltp),
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    badge,
    tone,
    pnlValue: pnl,
    invested: activeTradeInvested(trade),
    source: 'liquide',

    // Liquide specific:
    entryStartPrice: trade.entryStartPrice,
    entryEndPrice: trade.entryEndPrice,
    entryRangeText,
    recommendedAt: trade.recommendedAt,
    recommendedAtText: trade.recommendedAt ? formatPrice(trade.recommendedAt) : undefined,
    targetPrice: trade.targetPrice,
    targetPriceText: trade.targetPrice ? formatPrice(trade.targetPrice) : undefined,
    stopLoss: trade.stopLoss,
    stopLossText: trade.stopLoss && trade.stopLoss > 0 ? formatPrice(trade.stopLoss) : '—',
    potentialUpside,
    potentialUpsideText,
    adviceDate: trade.adviceDate,
    reportLink: trade.reportLink,
    horizon: trade.horizon,
    recommendedQty: trade.recommendedQty,
  };
}

function coinbaseToStockPosition(trade: CoinbaseTrade): StockPosition {
  const pnl = trade.runtimePnl ?? 0;
  const iPrice = trade.iPrice ?? 0;
  const cPrice = trade.cPrice ?? 0;
  const percent = iPrice > 0 ? ((cPrice - iPrice) / iPrice) * 100 : 0;
  const tone = pnlTone(pnl) as 'win' | 'loss';
  const badge = cPrice >= (trade.target ?? 0) ? 'Target Hit' : (trade.sl && trade.sl > 0 ? `SL: ${formatPrice(trade.sl)}` : 'Active');

  const rec1 = trade.recommendedPrice1 ?? 0;
  const rec2 = trade.recommendedPrice2 ?? 0;
  const recommendedRangeText = rec1 > 0 && rec2 > 0
    ? `${formatPrice(rec1)} - ${formatPrice(rec2)}`
    : (rec1 > 0 ? formatPrice(rec1) : (rec2 > 0 ? formatPrice(rec2) : formatPrice(iPrice)));

  const target = trade.target ?? 0;
  const entryTime = trade.EntryTime || trade.entryTime || trade.createdAt;
  const entryTimeText = entryTime ? formatDateTime(entryTime) : undefined;
  const potentialUpside = iPrice > 0 && target > 0
    ? ((target - iPrice) / iPrice) * 100
    : undefined;
  const potentialUpsideText = potentialUpside !== undefined
    ? `${potentialUpside >= 0 ? '+' : ''}${potentialUpside.toFixed(2)}%`
    : undefined;

  return {
    id: trade.callId,
    ticker: tickerFromSymbol(trade.symbol ?? ''),
    title: trade.name ?? 'Unknown',
    symbol: trade.symbol ?? '',
    name: trade.name ?? 'Unknown',
    subtitle: `${trade.name ?? 'Unknown'} · Equity CNC · ${trade.quantity ?? 0} Qty`,
    entry: formatPrice(iPrice),
    ltp: formatPrice(cPrice),
    pnl: formatCurrency(pnl),
    percent: formatPercent(percent),
    badge,
    tone,
    pnlValue: pnl,
    invested: coinbaseInvested(trade),
    source: 'coinbase',

    // Coinbase specific:
    iPrice: trade.iPrice,
    iPriceText: trade.iPrice ? formatPrice(trade.iPrice) : undefined,
    cPrice: trade.cPrice,
    quantity: trade.quantity,
    target: trade.target,
    targetText: trade.target ? formatPrice(trade.target) : undefined,
    sl: trade.sl,
    slText: trade.sl && trade.sl > 0 ? formatPrice(trade.sl) : '—',
    recommendedPrice1: trade.recommendedPrice1,
    recommendedPrice2: trade.recommendedPrice2,
    recommendedRangeText,
    duration: trade.duration,
    entryTime,
    entryTimeText,
    potentialUpside,
    potentialUpsideText,
  };
}

export function mapStockPositions(
  activeTrades: ActiveTrade[],
  coinbaseStocks: CoinbaseTrade[],
): StockPosition[] {
  const fromActive = activeTrades
    .filter((t) => t.status === 'active' || t.status === 'Live')
    .map(activeTradeToStockPosition);
  const fromCoinbase = coinbaseStocks
    .filter((t) => !t.exited && t.status !== 'closed' && t.status !== 'Exited')
    .map(coinbaseToStockPosition);
  return [...fromActive, ...fromCoinbase];
}

export function mapArchiveStocks(
  coinbaseStocks: CoinbaseTrade[],
): StockPosition[] {
  return coinbaseStocks
    .filter((t) => t.exited)
    .map(coinbaseToStockPosition);
}

export function mapPositions(positions: Position[]): PositionRow[] {
  return positions.map((p) => {
    const pnl = p.exitPrice != null ? (p.exitPrice - p.entryPrice) * p.quantity : 0;
    const invested = p.entryPrice * p.quantity;
    const percent = p.entryPrice > 0 ? (((p.exitPrice ?? 0) - p.entryPrice) / p.entryPrice) * 100 : 0;
    return {
      id: p.id,
      ticker: tickerFromSymbol(p.symbol),
      title: p.symbol,
      symbol: p.symbol,
      name: p.name,
      subtitle: `${p.name} · ${p.quantity} Qty · ${p.optionType}`,
      entry: formatPrice(p.entryPrice),
      ltp: p.exitPrice != null ? formatPrice(p.exitPrice) : '—',
      pnl: formatCurrency(pnl),
      percent: formatPercent(percent),
      tone: pnlTone(pnl) as 'win' | 'loss',
      pnlValue: pnl,
      invested,
      status: p.status,
      exitPrice: p.exitPrice != null ? formatPrice(p.exitPrice) : undefined,
      source: p.source,
    };
  });
}

export function mapWatchItems(
  fnoActiveTrades: FnoTrade[],
  coinbaseOptions: CoinbaseTrade[],
  coinbaseStocks: CoinbaseTrade[],
): WatchItem[] {
  const fromFno: WatchItem[] = fnoActiveTrades
    .filter((t) => t.status === 'active' || t.status === 'Live')
    .map((t) => ({
    ticker: tickerFromSymbol(safeFnoScrip(t).symbol),
    name: t.equityScrip?.name ?? 'Unknown',
    symbol: safeFnoScrip(t).symbol,
    logo: t.equityScrip?.logo,
    logolarge: t.equityScrip?.logolarge,
    logoLarge: t.equityScrip?.logoLarge,
    value: (t.entryEndPrice ?? 0).toFixed(2),
    change: formatPercent(t.potentialReturns?.percentage ?? 0),
    tone: pnlTone(t.potentialReturns?.percentage ?? 0) as 'win' | 'loss',
    source: 'liquide' as const,
  }));
  const fromCoinbase: WatchItem[] = [...coinbaseOptions, ...coinbaseStocks]
    .filter((t) => !t.exited && t.status !== 'closed' && t.status !== 'Exited')
    .map((t) => ({
    ticker: tickerFromSymbol(t.symbol ?? ''),
    name: t.name ?? 'Unknown',
    symbol: t.symbol ?? '',
    value: (t.cPrice ?? 0).toFixed(2),
    change: formatPercent(
      (t.iPrice ?? 0) > 0 ? (((t.cPrice ?? 0) - t.iPrice) / t.iPrice) * 100 : 0,
    ),
    tone: pnlTone(t.runtimePnl ?? 0) as 'win' | 'loss',
    source: 'coinbase' as const,
  }));
  const seen = new Set<string>();
  return [...fromFno, ...fromCoinbase].filter((item) => {
    if (seen.has(item.ticker)) return false;
    seen.add(item.ticker);
    return true;
  });
}

export function computePortfolioSummary(
  openOptions: OpenOptionPosition[],
  stocks: StockPosition[],
): PortfolioSummary {
  const optionPnl = openOptions.reduce((sum, o) => sum + o.pnlValue, 0);
  const stockPnl = stocks.reduce((sum, s) => sum + s.pnlValue, 0);
  const totalPnl = optionPnl + stockPnl;
  const invested = openOptions.reduce((sum, o) => sum + o.invested, 0) + stocks.reduce((sum, s) => sum + s.invested, 0);
  const activeCount = openOptions.length + stocks.length;
  const dayReturn = invested > 0 ? (totalPnl / invested) * 100 : 0;
  return { totalPnl, invested, dayReturn, activeCount };
}

export type AnalysisRange = 'Day' | 'Week' | 'Month';

interface TradeEntry {
  date: Date;
  ticker: string;
  title: string;
  pnl: number;
  source?: string;
  type?: string;
}

export function parseTradeDate(val?: string | number | null, fallbackDate?: string | number | null): Date {
  if (!val && fallbackDate) return parseTradeDate(fallbackDate);
  if (!val) return new Date(2026, 8, 11);
  if (typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  const str = String(val).trim();
  // Handle formats like "11 Sep '26 11:21 am"
  const cleanStr = str.replace(/'(\d{2})/, (_m, y) => `20${y}`);
  let d = new Date(cleanStr);
  if (isNaN(d.getTime())) {
    // Regex matching "11 Sep, 01:18 pm" or "Sep 11, 2:48 pm"
    const match1 = str.match(/(\d{1,2})\s+([A-Za-z]{3})/i);
    const match2 = str.match(/([A-Za-z]{3})\s+(\d{1,2})/i);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    if (match1) {
      const day = parseInt(match1[1], 10);
      const m = months[match1[2].toLowerCase()];
      if (m !== undefined) {
        d = new Date(2026, m, day);
      }
    } else if (match2) {
      const m = months[match2[1].toLowerCase()];
      const day = parseInt(match2[2], 10);
      if (m !== undefined) {
        d = new Date(2026, m, day);
      }
    }
  }
  // Standard JS Date constructor defaults to year 2001 when string has no year (e.g. "11 Sep, 01:18 pm")
  if (!isNaN(d.getTime()) && d.getFullYear() < 2020) {
    d.setFullYear(2026);
  }
  return isNaN(d.getTime()) ? new Date(2026, 8, 11) : d;
}

function getRangeDetails(d: Date, range: AnalysisRange): { key: string; sortKey: number; label: string } {
  if (range === 'Day') {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return {
      key: formatted,
      sortKey: dayStart.getTime(),
      label: `${dayName}, ${formatted}`,
    };
  }
  if (range === 'Week') {
    const dCopy = new Date(d);
    const dayOfWeek = (dCopy.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(dCopy);
    monday.setDate(dCopy.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const monStr = monday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const sunStr = sunday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatted = `${monStr} – ${sunStr}`;
    return {
      key: formatted,
      sortKey: monday.getTime(),
      label: formatted,
    };
  }
  // Month
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const formatted = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return {
    key: formatted,
    sortKey: monthStart.getTime(),
    label: formatted,
  };
}

export function buildAnalysisDays(
  fnoTrades: FnoTrade[],
  coinbaseTrades: CoinbaseTrade[],
  range: AnalysisRange = 'Day',
  _activeTrades?: ActiveTrade[],
  allowedSources?: Set<string>,
): AnalysisDayRow[] {
  const entries: TradeEntry[] = [];
  const isAll = !allowedSources || allowedSources.has('ALL');
  const includeFno = isAll || allowedSources.has('FNO');
  const includeCoinbase = isAll || allowedSources.has('COINBASE');

  if (includeFno) {
    for (const t of fnoTrades) {
      // Exclude active trades - only closed/settled trades in analytics
      const isClosed = Boolean(t.exitDate || t.returns || t.status === 'closed' || t.status === 'Closed' || t.status === 'settled' || t.status === 'Settled');
      if (!isClosed || t.status === 'active' || t.status === 'Live') continue;

      const date = parseTradeDate(t.exitDate || t.advisedAt, t.expiryDate);
      const isProfit = t.returns?.isProfit ?? ((t.returns?.value ?? 0) >= 0);
      const raw = Math.abs(t.returns?.value ?? t.potentialReturns?.value ?? 0);
      const pnl = isProfit ? raw : -raw;
      const symbol = safeFnoScrip(t).symbol;
      entries.push({
        date,
        ticker: tickerFromSymbol(symbol),
        title: symbol,
        pnl,
        source: 'FNO',
        type: 'Settled Option',
      });
    }
  }

  if (includeCoinbase) {
    for (const t of coinbaseTrades) {
      // Exclude active trades - only closed/exited trades in analytics
      const isClosed = Boolean(t.exited || t.status === 'closed' || t.status === 'Exited' || t.ExitTime || t.exitPrice || t.EPrices);
      if (!isClosed) continue;

      const date = parseTradeDate(t.ExitTime || t.exitTime || t.closedAt || t.createdAt || t.entryTime);
      const pnl = t.runtimePnl ?? 0;
      const title = t.name || t.symbol || 'Trade';
      const ticker = tickerFromSymbol(t.symbol || t.name || '');
      entries.push({
        date,
        ticker,
        title,
        pnl,
        source: 'COINBASE',
        type: t.optionType ? 'Settled Option' : 'Exited Stock',
      });
    }
  }

  // Active trades are not included in Analytics

  const groups = new Map<
    string,
    {
      sortKey: number;
      label: string;
      pnl: number;
      count: number;
      wins: number;
      losses: number;
      rows: AnalysisDayRow['tradeRows'];
    }
  >();

  for (const e of entries) {
    const { key, sortKey, label } = getRangeDetails(e.date, range);
    const existing = groups.get(key) ?? {
      sortKey,
      label,
      pnl: 0,
      count: 0,
      wins: 0,
      losses: 0,
      rows: [],
    };
    existing.pnl += e.pnl;
    existing.count += 1;
    if (e.pnl > 0) existing.wins += 1;
    else if (e.pnl < 0) existing.losses += 1;

    existing.rows.push({
      ticker: e.ticker,
      title: e.title,
      pnl: formatCurrency(e.pnl),
      tone: pnlTone(e.pnl) as 'win' | 'loss',
      source: e.source,
      type: e.type,
    });
    groups.set(key, existing);
  }

  const maxAbsPnl = Array.from(groups.values()).reduce((max, g) => Math.max(max, Math.abs(g.pnl)), 1);

  return Array.from(groups.values())
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((data) => {
      let subtitle = '';
      if (range === 'Day') {
        subtitle = `${data.count} ${data.count === 1 ? 'trade' : 'trades'} · ${data.wins} ${data.wins === 1 ? 'win' : 'wins'}${data.losses > 0 ? ` · ${data.losses} ${data.losses === 1 ? 'loss' : 'losses'}` : ''}`;
      } else {
        const winRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
        subtitle = `${data.count} trades · ${data.wins} wins (${winRate}% win rate)`;
      }

      // Proportional bar width: scale visually between 14% and 85%
      const relWidth = Math.min(Math.max((Math.abs(data.pnl) / maxAbsPnl) * 75, 14), 85);

      return {
        date: data.label,
        trades: subtitle,
        pnl: formatCurrency(data.pnl),
        pnlValue: data.pnl,
        tone: pnlTone(data.pnl) as 'win' | 'loss',
        width: `${relWidth.toFixed(1)}%`,
        open: false,
        tradeRows: data.rows,
      };
    });
}

export function computeFilteredMetrics(
  fnoTrades: FnoTrade[],
  coinbaseTrades: CoinbaseTrade[],
  _activeTrades?: ActiveTrade[],
  allowedSources?: Set<string>,
) {
  const isAll = !allowedSources || allowedSources.has('ALL');
  const includeFno = isAll || allowedSources.has('FNO');
  const includeCoinbase = isAll || allowedSources.has('COINBASE');

  let netPnl = 0;
  let totalTrades = 0;
  let winCount = 0;
  let lossCount = 0;

  if (includeFno) {
    for (const t of fnoTrades) {
      // Exclude active trades
      const isClosed = Boolean(t.exitDate || t.returns || t.status === 'closed' || t.status === 'Closed' || t.status === 'settled' || t.status === 'Settled');
      if (!isClosed || t.status === 'active' || t.status === 'Live') continue;

      const isProfit = t.returns?.isProfit ?? ((t.returns?.value ?? 0) >= 0);
      const raw = Math.abs(t.returns?.value ?? t.potentialReturns?.value ?? 0);
      const pnl = isProfit ? raw : -raw;

      netPnl += pnl;
      totalTrades += 1;
      if (pnl > 0) winCount += 1;
      else if (pnl < 0) lossCount += 1;
    }
  }

  if (includeCoinbase) {
    for (const t of coinbaseTrades) {
      // Exclude active trades
      const isClosed = Boolean(t.exited || t.status === 'closed' || t.status === 'Exited' || t.ExitTime || t.exitPrice || t.EPrices);
      if (!isClosed) continue;

      const pnl = t.runtimePnl ?? 0;
      netPnl += pnl;
      totalTrades += 1;
      if (pnl > 0) winCount += 1;
      else if (pnl < 0) lossCount += 1;
    }
  }

  // Active trades are not included in Analytics

  const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;

  return {
    netPnl,
    totalTrades,
    winCount,
    lossCount,
    winRate,
  };
}

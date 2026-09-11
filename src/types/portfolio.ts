import type { ActiveTrade, FnoTrade, CoinbaseTrade, PositionSource, FnoMultiTarget, FnoPotentialReturns, FnoReturns } from './trade';

export type DataSource = PositionSource;

export interface OpenOptionPosition {
  id: string;
  ticker: string;
  title: string;
  symbol: string;
  name: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  subtitle: string;
  entry: string;
  entryRangeText: string;
  entryStartPrice?: number;
  entryEndPrice?: number;
  recommendedPrice?: number;
  stopLossPrice?: number;
  targetPrice?: number;
  stopLossText?: string;
  targetPriceText?: string;
  entryTime?: string | number;
  entryTimeText?: string;
  riskRewardRatio?: string;
  ltp: string;
  pnl: string;
  percent: string;
  type: 'CE' | 'PE';
  pnlValue: number;
  invested: number;
  source: DataSource;

  // Liquide specific fields:
  entryPrice?: number;
  lotSize?: number;
  multiTargetList?: FnoMultiTarget[];
  currentTargetIndex?: number;
  potentialReturns?: FnoPotentialReturns;
  potentialReturnsFormatted?: {
    value: string;
    percentage: string;
  };

  // Coinbase specific fields:
  iPrice?: number;
  quantity?: number;
  recommendedPrice1?: number;
  recommendedPrice2?: number;
  sl?: number;
  target?: number;

  marginRequired?: number;
  requiredCapital?: number;
  requiredCapitalText?: string;

  // Return Metric (Closed Options — Centered Return Metric in open cards)
  returns?: FnoReturns;
  returnMetric?: {
    value: number;
    percentage: number;
    isProfit: boolean;
    returnAmnt: string;
    returnPct: string;
  };
}

export interface ClosedOptionPosition {
  id: string;
  ticker: string;
  title: string;
  symbol: string;
  name: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  subtitle: string;
  entry: string;
  entryRangeText?: string;
  entryPrice?: number;
  entryPriceText?: string;
  entryTime?: string | number | null;
  entryTimeText?: string;
  exit: string;
  exitTime?: string | number | null;
  exitTimeText?: string;
  stopLossPrice?: number;
  targetPrice?: number;
  stopLossText?: string;
  targetPriceText?: string;
  riskRewardRatio?: string;
  lotSize?: number;
  recommendedLotSize?: number;
  pnl: string;
  percent: string;
  detail: string;
  tone: 'win' | 'loss';
  pnlValue: number;
  source: DataSource;
  type?: 'CE' | 'PE';

  // Liquide (fno_trades/closed) fields:
  currentTargetIndex?: number;
  exitDate?: string;
  exitPrice?: number;
  exitPriceText?: string;
  exitType?: string;
  isEarlyProfitAchieved?: boolean;
  partialProfitBookedAt?: string | number | null;
  returns?: FnoReturns;
  multiTargetList?: FnoMultiTarget[];
  potentialReturns?: FnoPotentialReturns;

  // Coinbase fields:
  ExitTime?: string;
  EPrices?: number | number[] | string;
  IPrices?: number | number[] | string;
  EntryTime?: string;
  Quantity?: number; // Quantity is per lot
  quantityPerLotText?: string;
  ePricesText?: string;
  iPricesText?: string;
}

export interface StockPosition {
  id: string;
  ticker: string;
  title: string;
  symbol: string;
  name: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  subtitle: string;
  entry: string;
  ltp: string;
  pnl: string;
  percent: string;
  badge: string;
  tone: 'win' | 'loss';
  pnlValue: number;
  invested: number;
  source: DataSource;

  // Liquide specific:
  entryStartPrice?: number;
  entryEndPrice?: number;
  entryRangeText?: string;
  recommendedAt?: number;
  recommendedAtText?: string;
  targetPrice?: number;
  targetPriceText?: string;
  stopLoss?: number;
  stopLossText?: string;
  potentialUpside?: number;
  potentialUpsideText?: string;
  adviceDate?: string;
  reportLink?: string;
  horizon?: string;
  recommendedQty?: number;

  // Coinbase specific:
  iPrice?: number;
  iPriceText?: string;
  cPrice?: number;
  quantity?: number;
  target?: number;
  targetText?: string;
  sl?: number;
  slText?: string;
  recommendedPrice1?: number;
  recommendedPrice2?: number;
  recommendedRangeText?: string;
  duration?: string;
  entryTime?: string;
  entryTimeText?: string;
}

export interface PositionRow {
  id: string;
  ticker: string;
  title: string;
  symbol: string;
  name: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  subtitle: string;
  entry: string;
  ltp: string;
  pnl: string;
  percent: string;
  tone: 'win' | 'loss';
  pnlValue: number;
  invested: number;
  status: 'open' | 'closed';
  exitPrice?: string;
  source: DataSource;
}

export interface AnalysisDayRow {
  date: string;
  trades: string;
  pnl: string;
  pnlValue: number;
  tone: 'win' | 'loss';
  width: string;
  open?: boolean;
  tradeRows: { ticker: string; title: string; pnl: string; tone: 'win' | 'loss' }[];
}

export interface WatchItem {
  ticker: string;
  name: string;
  symbol: string;
  logo?: string | null;
  logolarge?: string | null;
  logoLarge?: string | null;
  value: string;
  change: string;
  tone: 'win' | 'loss';
  source: DataSource;
}

export interface PortfolioSummary {
  totalPnl: number;
  invested: number;
  dayReturn: number;
  activeCount: number;
}

export interface PortfolioDerived {
  openOptions: OpenOptionPosition[];
  closedOptions: ClosedOptionPosition[];
  stockPositions: StockPosition[];
  archiveStocks: StockPosition[];
  openPositions: PositionRow[];
  closedPositions: PositionRow[];
  watchItems: WatchItem[];
  summary: PortfolioSummary;
  netPnl: number;
  totalTrades: number;
  winCount: number;
  winRate: number;
}

export type { ActiveTrade, FnoTrade, CoinbaseTrade };

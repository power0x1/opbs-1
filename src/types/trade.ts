export type TradeStatus = 'active' | 'closed' | 'Live' | 'Exited';

export interface EquityScrip {
  _id: string;
  isin?: string;
  liquideScore?: number;
  logo?: string;
  logolarge?: string;
  logoLarge?: string;
  name: string;
  shortName?: string;
  slug?: string;
  symbol: string;
  tradeScore?: number;
}

export interface Advisory {
  _id: string;
  name: string;
  logo?: string;
}

export interface ActiveTrade {
  _id: string;
  adviceDate: string;
  advisory: Advisory;
  createdAt: string;
  customMessage: string;
  entryEndPrice: number;
  entryStartPrice: number;
  hideRange: boolean;
  horizon: string;
  investedValue: number;
  isAvailableForAveraging: boolean;
  isCostToCostAchieved: boolean;
  isOutOfBuyingZone: boolean;
  isSnoozed: boolean;
  isStoplossHit: boolean;
  isTargetAchieved: boolean;
  isTargetOnlyTrade: boolean;
  isTradeReInvested: boolean;
  potentialUpside: number;
  recommendedAt: number;
  recommendedQty: number;
  reportLink: string;
  scrip: EquityScrip;
  status: TradeStatus;
  stopLoss: number;
  targetPrice: number;
}

export interface FnoMultiTarget {
  target: number;
  targetHit: boolean;
  targetHitDate: string | null;
}

export interface FnoScrip {
  _id: string;
  expiryDate: string;
  lotSize: number;
  lotSizeNum?: number;
  parentScrip: string;
  shortSymbol: string;
  status: string;
  symbol: string;
  logo?: string;
  logolarge?: string;
  logoLarge?: string;
}

export interface FnoPotentialReturns {
  percentage: number;
  value: number;
}

export interface FnoReturns {
  isProfit?: boolean;
  partialProfit?: unknown;
  percentage?: number;
  value?: number;
}

export type FnoOptionType = 'CE' | 'PE';

export interface FnoTrade {
  _id: string;
  advisedAt: string;
  advisory: Advisory;
  currentTargetIndex: number;
  entryEndPrice: number;
  entryStartPrice: number;
  entryPrice?: number;
  equityScrip: EquityScrip;
  expiryDate: string;
  isCarryForwarded: boolean;
  isOutOfBuyingRange: boolean;
  lotSize: number;
  multiTargetList: FnoMultiTarget[];
  optionType: FnoOptionType;
  partialProfitBookedAt: string | null;
  potentialReturns: FnoPotentialReturns;
  recommendedAt: number;
  recommendedLotSize: number;
  recommendedPrice: number;
  scrip: FnoScrip;
  status: string;
  stopLossPrice: number;
  strikePrice: number;
  targetPrice: number;
  transactionType: string;
  type: string;

  // Closed fields:
  exitDate?: string;
  exitPrice?: number;
  exitType?: string;
  isEarlyProfitAchieved?: boolean;
  returns?: FnoReturns;
}

export type CoinbaseAsset = 'Stock' | 'Option';

export interface CoinbaseTrade {
  asset: CoinbaseAsset;
  cPrice: number;
  callId: string;
  createdAt: string;
  duration: string;
  entryPrice: number;
  entryTime: string;
  exchange: string;
  exitPrice: number;
  exited: boolean;
  iPrice: number;
  id: number;
  indexSymbol: string;
  lastPnlUpdate: string;
  marginRequired: number;
  maxLoss: number;
  maxProfit: number;
  name: string;
  quantity: number;
  recommendedPrice1: number;
  recommendedPrice2: number;
  runtimePnl: number;
  sl: number;
  status: string;
  symbol: string;
  target: number;
  token: string;
  transactionType: string;
  updatedAt: string;

  // Closed & format fields:
  ExitTime?: string;
  exitTime?: string;
  EPrices?: number | number[] | string;
  IPrices?: number | number[] | string;
  EntryTime?: string;
  Quantity?: number;
  lots?: number;
  recommendedLotSize?: number;
}

export type PositionSource = 'liquide' | 'coinbase';

export interface Position {
  id: string;
  symbol: string;
  name: string;
  optionType: 'CE' | 'PE';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  status: 'open' | 'closed';
  source: PositionSource;
  sourceTradeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PositionInput = Omit<Position, 'id' | 'createdAt' | 'updatedAt'>;
export type PositionUpdate = Partial<Omit<Position, 'id' | 'createdAt' | 'updatedAt'>>;

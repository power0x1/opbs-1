export type Tab = 'Watchlist' | 'Options' | 'Positions' | 'Stocks' | 'Analysis';
export type ViewMode = 'options' | 'futures' | 'closed' | 'open';

export type {
  ActiveTrade,
  FnoTrade,
  CoinbaseTrade,
  TradeStatus,
  FnoOptionType,
  FnoMultiTarget,
  FnoPotentialReturns,
  FnoReturns,
  Position,
  PositionInput,
  PositionUpdate,
  PositionSource,
} from './trade';

export type {
  DataSource,
  OpenOptionPosition,
  ClosedOptionPosition,
  StockPosition,
  PositionRow,
  AnalysisDayRow,
  WatchItem,
  PortfolioSummary,
  PortfolioDerived,
} from './portfolio';

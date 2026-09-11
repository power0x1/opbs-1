export const FIREBASE_COLLECTIONS = {
  ACTIVE_TRADES: 'active_trades',
  COINBASE_OPTIONS: 'coinbase_options',
  COINBASE_STOCK: 'coinbase_stock',
  FNO_ACTIVE: 'fno_trades/active',
  FNO_CLOSED: 'fno_trades/closed',
  POSITIONS: 'positions',
  MARKET_SUMMARY: 'market_summary',
  ESP32: 'esp32',
} as const;

export const TRADE_STATUSES = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  LIVE: 'Live',
  EXITED: 'Exited',
} as const;

export const HORIZONS = {
  SHORT: 'Short',
  MEDIUM: 'Medium',
  LONG: 'Long',
} as const;

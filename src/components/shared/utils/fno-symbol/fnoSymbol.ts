import type { FnoTrade } from '@/types/trade';

export function fnoSymbol(trade: FnoTrade): string {
  const scrip = trade.scrip;
  if (scrip?.symbol) return scrip.symbol;
  if (trade.equityScrip?.symbol) return trade.equityScrip.symbol;
  return 'UNKNOWN';
}

export function fnoName(trade: FnoTrade): string {
  return trade.equityScrip?.name ?? 'Unknown';
}

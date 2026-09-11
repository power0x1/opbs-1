/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ActiveTrade, FnoTrade, CoinbaseTrade, Position } from '@/types/trade';
import { usePortfolioSubscriptions } from './usePortfolioSubscriptions';
import {
  mapOpenOptionPositions,
  mapClosedOptionPositions,
  mapStockPositions,
  mapArchiveStocks,
  mapPositions,
  mapWatchItems,
  computePortfolioSummary,
} from '@/services';
import type { PortfolioDerived } from '@/types';

interface PortfolioContextValue extends PortfolioDerived {
  fnoActiveTrades: FnoTrade[];
  fnoClosedTrades: FnoTrade[];
  activeTrades: ActiveTrade[];
  allCoinbaseTrades: CoinbaseTrade[];
  positions: Position[];
  loading: boolean;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const {
    activeTrades,
    fnoActiveTrades,
    fnoClosedTrades,
    coinbaseOptions,
    coinbaseStocks,
    positions,
    loading,
    error,
  } = usePortfolioSubscriptions();

  const allFnoTrades = useMemo<FnoTrade[]>(
    () => [...fnoActiveTrades, ...fnoClosedTrades],
    [fnoActiveTrades, fnoClosedTrades],
  );

  const derived = useMemo<PortfolioDerived>(() => {
    const openOptions = mapOpenOptionPositions(fnoActiveTrades, coinbaseOptions);
    const closedOptions = mapClosedOptionPositions(fnoClosedTrades, coinbaseOptions);
    const stockPositions = mapStockPositions(activeTrades, coinbaseStocks);
    const archiveStocks = mapArchiveStocks(coinbaseStocks);
    const allPositionRows = mapPositions(positions);
    const openPositions = allPositionRows.filter((p) => p.status === 'open');
    const closedPositions = allPositionRows.filter((p) => p.status === 'closed');
    const watchItems = mapWatchItems(fnoActiveTrades, coinbaseOptions, coinbaseStocks);
    const summary = computePortfolioSummary(openOptions, stockPositions);

    const allPnl: number[] = [
      ...allFnoTrades.map((t: FnoTrade) => t.potentialReturns?.value ?? 0),
      ...coinbaseOptions.map((t: CoinbaseTrade) => t.runtimePnl ?? 0),
      ...coinbaseStocks.map((t: CoinbaseTrade) => t.runtimePnl ?? 0),
    ];
    const netPnl = allPnl.reduce((sum, p) => sum + p, 0);
    const totalTrades = allPnl.length;
    const winCount = allPnl.filter((p) => p > 0).length;
    const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;

    return {
      openOptions,
      closedOptions,
      stockPositions,
      archiveStocks,
      openPositions,
      closedPositions,
      watchItems,
      summary,
      netPnl,
      totalTrades,
      winCount,
      winRate,
    };
  }, [activeTrades, fnoActiveTrades, fnoClosedTrades, coinbaseOptions, coinbaseStocks, positions, allFnoTrades]);

  const allCoinbaseTrades = useMemo<CoinbaseTrade[]>(
    () => [...coinbaseOptions, ...coinbaseStocks],
    [coinbaseOptions, coinbaseStocks],
  );

  const value = useMemo<PortfolioContextValue>(
    () => ({
      ...derived,
      fnoActiveTrades,
      fnoClosedTrades,
      activeTrades,
      allCoinbaseTrades,
      positions,
      loading,
      error,
    }),
    [derived, fnoActiveTrades, fnoClosedTrades, activeTrades, allCoinbaseTrades, positions, loading, error],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}

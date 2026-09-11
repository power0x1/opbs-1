import { useEffect, useState } from 'react';
import {
  subscribeToActiveTrades,
  subscribeToFnoActiveTrades,
  subscribeToFnoClosedTrades,
  subscribeToCoinbaseOptions,
  subscribeToCoinbaseStocks,
} from '@/firebase';
import { subscribeToPositions } from '@/services';
import type { ActiveTrade, FnoTrade, CoinbaseTrade, Position } from '@/types/trade';

export interface PortfolioRawData {
  activeTrades: ActiveTrade[];
  fnoActiveTrades: FnoTrade[];
  fnoClosedTrades: FnoTrade[];
  coinbaseOptions: CoinbaseTrade[];
  coinbaseStocks: CoinbaseTrade[];
  positions: Position[];
  loading: boolean;
  error: string | null;
}

export function usePortfolioSubscriptions(): PortfolioRawData {
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [fnoActiveTrades, setFnoActiveTrades] = useState<FnoTrade[]>([]);
  const [fnoClosedTrades, setFnoClosedTrades] = useState<FnoTrade[]>([]);
  const [coinbaseOptions, setCoinbaseOptions] = useState<CoinbaseTrade[]>([]);
  const [coinbaseStocks, setCoinbaseStocks] = useState<CoinbaseTrade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pending = 6;
    let cancelled = false;

    function markDone() {
      pending -= 1;
      if (pending <= 0 && !cancelled) {
        setLoading(false);
        setError(null);
      }
    }

    const fallbackTimeout = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 3500);

    const unsubActive = subscribeToActiveTrades((data) => {
      if (cancelled) return;
      setActiveTrades(data);
      markDone();
    });

    const unsubFnoActive = subscribeToFnoActiveTrades((data) => {
      if (cancelled) return;
      setFnoActiveTrades(data);
      markDone();
    });

    const unsubFnoClosed = subscribeToFnoClosedTrades((data) => {
      if (cancelled) return;
      setFnoClosedTrades(data);
      markDone();
    });

    const unsubOptions = subscribeToCoinbaseOptions((data) => {
      if (cancelled) return;
      setCoinbaseOptions(data);
      markDone();
    });

    const unsubStocks = subscribeToCoinbaseStocks((data) => {
      if (cancelled) return;
      setCoinbaseStocks(data);
      markDone();
    });

    const unsubPositions = subscribeToPositions((data) => {
      if (cancelled) return;
      setPositions(data);
      markDone();
    });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimeout);
      unsubActive();
      unsubFnoActive();
      unsubFnoClosed();
      unsubOptions();
      unsubStocks();
      unsubPositions();
    };
  }, []);

  return {
    activeTrades,
    fnoActiveTrades,
    fnoClosedTrades,
    coinbaseOptions,
    coinbaseStocks,
    positions,
    loading,
    error,
  };
}

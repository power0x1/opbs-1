import { ref, get, onValue, type Unsubscribe } from 'firebase/database';
import { db } from './config';
import { FIREBASE_COLLECTIONS } from '@/constants/trades';
import type { ActiveTrade, FnoTrade, CoinbaseTrade } from '@/types/trade';

function collectionRef(path: string) {
  return ref(db, path);
}

function objectToArray<T>(obj: Record<string, T> | null | undefined): T[] {
  if (!obj) return [];
  return Object.values(obj);
}

export async function fetchActiveTrades(): Promise<ActiveTrade[]> {
  const snap = await get(collectionRef(FIREBASE_COLLECTIONS.ACTIVE_TRADES));
  return objectToArray<ActiveTrade>(snap.val());
}

export async function fetchFnoActiveTrades(): Promise<FnoTrade[]> {
  const snap = await get(collectionRef(FIREBASE_COLLECTIONS.FNO_ACTIVE));
  return objectToArray<FnoTrade>(snap.val());
}

export async function fetchFnoClosedTrades(): Promise<FnoTrade[]> {
  const snap = await get(collectionRef(FIREBASE_COLLECTIONS.FNO_CLOSED));
  return objectToArray<FnoTrade>(snap.val());
}

export async function fetchCoinbaseOptions(): Promise<CoinbaseTrade[]> {
  const snap = await get(collectionRef(FIREBASE_COLLECTIONS.COINBASE_OPTIONS));
  return objectToArray<CoinbaseTrade>(snap.val());
}

export async function fetchCoinbaseStocks(): Promise<CoinbaseTrade[]> {
  const snap = await get(collectionRef(FIREBASE_COLLECTIONS.COINBASE_STOCK));
  return objectToArray<CoinbaseTrade>(snap.val());
}

export async function fetchAllCoinbaseTrades(): Promise<CoinbaseTrade[]> {
  const [options, stocks] = await Promise.all([fetchCoinbaseOptions(), fetchCoinbaseStocks()]);
  return [...options, ...stocks];
}

export function subscribeToActiveTrades(callback: (trades: ActiveTrade[]) => void): Unsubscribe {
  const r = collectionRef(FIREBASE_COLLECTIONS.ACTIVE_TRADES);
  return onValue(
    r,
    snap => callback(objectToArray<ActiveTrade>(snap.val())),
    error => {
      console.warn('subscribeToActiveTrades notice:', error.message);
      callback([]);
    }
  );
}

export function subscribeToFnoActiveTrades(callback: (trades: FnoTrade[]) => void): Unsubscribe {
  const r = collectionRef(FIREBASE_COLLECTIONS.FNO_ACTIVE);
  return onValue(
    r,
    snap => callback(objectToArray<FnoTrade>(snap.val())),
    error => {
      console.warn('subscribeToFnoActiveTrades notice:', error.message);
      callback([]);
    }
  );
}

export function subscribeToFnoClosedTrades(callback: (trades: FnoTrade[]) => void): Unsubscribe {
  const r = collectionRef(FIREBASE_COLLECTIONS.FNO_CLOSED);
  return onValue(
    r,
    snap => callback(objectToArray<FnoTrade>(snap.val())),
    error => {
      console.warn('subscribeToFnoClosedTrades notice:', error.message);
      callback([]);
    }
  );
}

export function subscribeToCoinbaseOptions(callback: (trades: CoinbaseTrade[]) => void): Unsubscribe {
  const r = collectionRef(FIREBASE_COLLECTIONS.COINBASE_OPTIONS);
  return onValue(
    r,
    snap => callback(objectToArray<CoinbaseTrade>(snap.val())),
    error => {
      console.warn('subscribeToCoinbaseOptions notice:', error.message);
      callback([]);
    }
  );
}

export function subscribeToCoinbaseStocks(callback: (trades: CoinbaseTrade[]) => void): Unsubscribe {
  const r = collectionRef(FIREBASE_COLLECTIONS.COINBASE_STOCK);
  return onValue(
    r,
    snap => callback(objectToArray<CoinbaseTrade>(snap.val())),
    error => {
      console.warn('subscribeToCoinbaseStocks notice:', error.message);
      callback([]);
    }
  );
}

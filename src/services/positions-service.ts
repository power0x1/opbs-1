import { ref, push, set, update, remove, onValue, type Unsubscribe } from 'firebase/database';
import { db } from '@/firebase';
import { FIREBASE_COLLECTIONS } from '@/constants/trades';
import type { Position, PositionInput, PositionUpdate } from '@/types/trade';

function positionsRef() {
  return ref(db, FIREBASE_COLLECTIONS.POSITIONS);
}

function positionRef(id: string) {
  return ref(db, `${FIREBASE_COLLECTIONS.POSITIONS}/${id}`);
}

function objectToArray<T extends { id: string }>(obj: Record<string, Omit<T, 'id'>> | null | undefined): T[] {
  if (!obj) return [];
  return Object.entries(obj).map(([id, value]) => ({ ...value, id }) as T);
}

export function subscribeToPositions(callback: (positions: Position[]) => void): Unsubscribe {
  return onValue(
    positionsRef(),
    (snap) => {
      callback(objectToArray<Position>(snap.val()));
    },
    (error) => {
      console.warn('subscribeToPositions notice:', error.message);
      callback([]);
    }
  );
}

export async function createPosition(input: PositionInput): Promise<string> {
  const now = new Date().toISOString();
  const newRef = push(positionsRef());
  const id = newRef.key as string;
  const position: Position = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  };
  await set(newRef, position);
  return id;
}

export async function updatePosition(id: string, updateData: PositionUpdate): Promise<void> {
  const payload = { ...updateData, updatedAt: new Date().toISOString() };
  await update(positionRef(id), payload);
}

export async function deletePosition(id: string): Promise<void> {
  await remove(positionRef(id));
}

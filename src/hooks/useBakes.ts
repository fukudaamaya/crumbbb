import { useState, useCallback } from 'react';
import { Bake, STORAGE_KEY } from '@/types/bake';

function loadBakes(): Bake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Bake[];
  } catch {
    return [];
  }
}

function saveBakes(bakes: Bake[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bakes));
}

export function useBakes() {
  const [bakes, setBakes] = useState<Bake[]>(loadBakes);

  const addBake = useCallback((bake: Bake) => {
    setBakes(prev => {
      const next = [...prev, bake];
      saveBakes(next);
      return next;
    });
  }, []);

  const updateBake = useCallback((id: string, updates: Partial<Bake>) => {
    setBakes(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      saveBakes(next);
      return next;
    });
  }, []);

  const deleteBake = useCallback((id: string) => {
    setBakes(prev => {
      const next = prev.filter(b => b.id !== id);
      saveBakes(next);
      return next;
    });
  }, []);

  const getBake = useCallback((id: string) => {
    return loadBakes().find(b => b.id === id) ?? null;
  }, []);

  return { bakes, addBake, updateBake, deleteBake, getBake };
}

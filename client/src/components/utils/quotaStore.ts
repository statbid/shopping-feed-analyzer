// src/stores/quotaStore.ts
import { create } from 'zustand';

interface QuotaStore {
  used: number;
  limit: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  setQuota: (used: number, limit: number, lastUpdated: Date) => void;
  setLoading: (loading: boolean) => void;
}

export const useQuotaStore = create<QuotaStore>((set) => ({
  used: 0,
  limit: 15000,
  lastUpdated: null,
  isLoading: false,
  setQuota: (used, limit, lastUpdated) => 
    set({ used, limit, lastUpdated, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading })
}));
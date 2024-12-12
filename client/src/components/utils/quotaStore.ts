import { create } from 'zustand';

interface QuotaStore {
  used: number;
  limit: number;
  lastUpdated: Date | null;
  remainingTime?: string;
  isLoading: boolean;
  setQuota: (used: number, limit: number, lastUpdated: Date, remainingTime?: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useQuotaStore = create<QuotaStore>((set) => ({
  used: 0,
  limit: 15000,
  lastUpdated: null,
  remainingTime: undefined,
  isLoading: false,
  setQuota: (used, limit, lastUpdated, remainingTime) => 
    set({ used, limit, lastUpdated, remainingTime, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading })
}));
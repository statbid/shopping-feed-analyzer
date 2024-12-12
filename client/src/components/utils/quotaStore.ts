/**
 * QuotaStore - Zustand Store for API Quota Tracking

 *
 * Key Features:
 * - Tracks the number of API requests used and the maximum allowed (quota limit).
 * - Stores the timestamp of the last quota update.
 * - Optionally tracks the remaining time until the quota resets.
 * - Manages a loading state to indicate when quota data is being fetched or updated.
 * - Provides actions to update quota data (`setQuota`) and toggle the loading state (`setLoading`).
 *
 * State Variables:
 * - `used`: Number of API requests that have been used.
 * - `limit`: Total number of API requests allowed (default: 15000).
 * - `lastUpdated`: Timestamp of the last quota update (or `null` if not set).
 * - `remainingTime`: Optional string representing the time remaining until quota resets.
 * - `isLoading`: Boolean indicating whether quota data is currently being fetched.
 *
 * Actions:
 * - `setQuota(used, limit, lastUpdated, remainingTime)`: Updates the quota data and stops loading.
 * - `setLoading(isLoading)`: Sets the `isLoading` state to indicate fetching or processing.
 *
 */

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
  
  /**
   * Updates the quota information and stops the loading state.
   * @param {number} used - Number of requests used.
   * @param {number} limit - Maximum allowed requests.
   * @param {Date} lastUpdated - Timestamp of the last update.
   * @param {string} [remainingTime] - Optional time remaining until quota resets.
   */
  setQuota: (used, limit, lastUpdated, remainingTime) => 
    set({ used, limit, lastUpdated, remainingTime, isLoading: false }),

  /**
   * Sets the loading state to indicate if data is being fetched or updated.
   * @param {boolean} isLoading - `true` to indicate loading, `false` otherwise.
   */
  setLoading: (isLoading) => set({ isLoading })
}));

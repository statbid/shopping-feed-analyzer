"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuotaStore = void 0;
// src/stores/quotaStore.ts
const zustand_1 = require("zustand");
exports.useQuotaStore = (0, zustand_1.create)((set) => ({
    used: 0,
    limit: 15000,
    lastUpdated: null,
    isLoading: false,
    setQuota: (used, limit, lastUpdated) => set({ used, limit, lastUpdated, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading })
}));

import { create } from "zustand";

export const useMarketStore = create((set) => ({
  price: 0,
  lastPrice: 0,
  signal: null,
  loading: false,

  setPrice: (price) =>
    set((s) => ({
      lastPrice: s.price || price,
      price,
    })),

  setSignal: (signal) => set({ signal }),
  setLoading: (v) => set({ loading: v }),
}));

"use client";

import { create } from "zustand";

export type LayerId =
  | "cyclone"
  | "rainfall"
  | "flood"
  | "risk"
  | "shelters"
  | "routes"
  | "memory";

export type LayerGroup = "Weather" | "Hazard" | "Response" | "History";

export const LAYER_META: { id: LayerId; label: string; group: LayerGroup }[] = [
  { id: "cyclone", label: "Cyclone track", group: "Weather" },
  { id: "rainfall", label: "Rainfall", group: "Weather" },
  { id: "flood", label: "Flood extent", group: "Hazard" },
  { id: "risk", label: "Risk zones", group: "Hazard" },
  { id: "shelters", label: "Shelters", group: "Response" },
  { id: "routes", label: "Evacuation routes", group: "Response" },
  { id: "memory", label: "Previous events", group: "History" },
];

/** Only UI presentation state lives here. All disaster domain data comes
 * from backend APIs via TanStack Query — never from this store. */
export interface UIState {
  mekoOn: boolean;
  toggleMeko: () => void;
  layers: Record<LayerId, boolean>;
  toggleLayer: (id: LayerId) => void;
  forecastHour: number;
  setForecastHour: (h: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mekoOn: true,
  toggleMeko: () => set((s) => ({ mekoOn: !s.mekoOn })),
  layers: {
    cyclone: true,
    rainfall: false,
    flood: true,
    risk: true,
    shelters: false,
    routes: false,
    memory: false,
  },
  toggleLayer: (id) =>
    set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  forecastHour: 0,
  setForecastHour: (h) => set({ forecastHour: h }),
}));
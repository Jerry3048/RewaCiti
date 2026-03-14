import { create } from "zustand";
import axios from "axios";
import type { AreaMap } from "../../../types";

interface AreaMapStore {
  areaMaps: AreaMap[];
  loading: boolean;
  error: string | null;
  fetchAreaMaps: () => Promise<void>;
}

export const useAreaMapStore = create<AreaMapStore>((set) => ({
  areaMaps: [],
  loading: false,
  error: null,

  fetchAreaMaps: async () => {
    set({ loading: true });
    try {
      const res = await axios.get<AreaMap[]>("/data/AreaMap.json");
      set({ 
        areaMaps: res.data, 
        loading: false, 
        error: null 
      });
    } catch (err) {
      console.error("Error fetching area maps:", err);
      set({ 
        error: "Failed to load area map data", 
        loading: false 
      });
    }
  },
}));

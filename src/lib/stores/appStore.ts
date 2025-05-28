import { create } from "zustand";
import { persist } from "zustand/middleware";

type WeightUnit = "lbs" | "kg";

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";

  // User Preferences
  weightUnit: WeightUnit;
  selectedUniversity: string;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setSelectedUniversity: (university: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      theme: "system",
      weightUnit: "lbs",
      selectedUniversity: "",

      // Actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setSelectedUniversity: (selectedUniversity) =>
        set({ selectedUniversity }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        weightUnit: state.weightUnit,
        selectedUniversity: state.selectedUniversity,
      }),
    }
  )
);

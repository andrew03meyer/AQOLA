import { create, useStore } from "zustand";
import { StateDefinition } from "./ChartStateModel";
import { AreaLayer, resolveAreaType } from "../lib/DatasetConfig";

type AppStore = {
  openCharts: StateDefinition[];
  minimisedCharts: StateDefinition[];
  selectedAreas: string[];
  selectedDataset: string;
  currentZoom: number;

  toggleArea: (area: string) => void;
  clearAreas: () => void;
  setDataset: (dataset: string) => void;
  loadChartState: (chartState: StateDefinition) => void;
  openChart: (chartName: string, position: [number, number]) => void;
  addOpenCharts: (charts: StateDefinition[]) => void;
  addMinimisedCharts: (charts: StateDefinition[]) => void;
  minimiseChart: (chartName: string, position: [number, number]) => void;
  removeMinimisedChart: (chartName: string) => void;
  removeOpenChart: (chartName: string) => void;
  findOpenChartFromName: (chartName: string) => StateDefinition | undefined;
  findMinimisedChartFromName: (chartName: string) => StateDefinition | undefined;
  focusChart: (chartName: string) => void;
  updateChartState: (chartName: string) => void;
  getFocusedChart: () => StateDefinition | undefined;
  getOpenCharts: () => StateDefinition[];
  getAllCharts: () => StateDefinition[];
  addAreas: (areas: string[]) => void;
  setZoom: (zoom: number) => void;
  updateChartLocation: (chartName: string, pos: [number, number]) => void;
};

const useAppStore = create<AppStore>((set, get) => ({
  openCharts: [],
  minimisedCharts: [],
  selectedAreas: [],
  selectedDataset: "crime",
  currentZoom: 7, // Decently zoomed out

  // Toggles an area in the selectedAreas array
  toggleArea: (area) =>
    set((state) => ({
      selectedAreas: state.selectedAreas.includes(area)
        ? state.selectedAreas.filter((a) => a !== area)
        : [...state.selectedAreas, area],
    })),

  // Add an array of areas, only the ones that aren't in the selectedAreas already
  addAreas: (areas) =>
    set((state) => ({
      selectedAreas: [
        ...state.selectedAreas,
        ...areas.filter((a) => !state.selectedAreas.includes(a)),
      ],
    })),

  // Empties the selectedAreas array
  clearAreas: () => set({ selectedAreas: [] }),

  // Sets the selected dataset and clears selected areas
  setDataset: (dataset) =>
    set({
      selectedDataset: dataset,
      selectedAreas: [],
    }),

  // Loads a chart state from openCharts into the main app state
  loadChartState: (chartState) =>
    set({
      selectedAreas: chartState.selectedAreas,
      selectedDataset: chartState.selectedDataset,
    }),

  // If chart is new, creates new state and adds to openCharts
  // If chart is minimised, moves it to openCharts
  openChart: (chartName, position) =>
    set((state) => {
      
      const isMinimised = state.minimisedCharts.find((g) => g.chartName === chartName);
      // If the chart is minimised, add its state to open and remove from minimised
      if (isMinimised !== undefined) {
        return { 
          openCharts: [isMinimised, ...state.openCharts],
          minimisedCharts: state.minimisedCharts.filter((g) => g.chartName !== chartName) 
        };
      }
      else {
        return {
          openCharts: [
            {
              chartName: chartName,
              selectedAreas: state.selectedAreas,
              selectedDataset: state.selectedDataset,
              position: position,
            },
            ...state.openCharts,
          ],
        };
      }
    }),

  addOpenCharts : (charts: StateDefinition[]) =>
    set((state) => {
      return {
        openCharts: [
          ...state.openCharts, 
          ...charts.filter(chart => !state.openCharts.some(openChart => openChart.chartName === chart.chartName))]
      };
    }),

  addMinimisedCharts : (charts: StateDefinition[]) =>
    set((state) => {
      return {
        minimisedCharts: [
          ...state.minimisedCharts, 
          ...charts.filter(chart => !state.minimisedCharts.some(minimisedChart => minimisedChart.chartName === chart.chartName))]
      };
    }),

  // Moves a chart from openCharts to minimisedCharts, keeping its state
  minimiseChart: (chartName, position) =>
    set((state) => {
      const chartToMinimise = state.openCharts.find((g) => g.chartName === chartName);
      // Add to minimisedCharts
      return{
        minimisedCharts: [
          {
            chartName: chartName,
            selectedAreas: chartToMinimise?.selectedAreas || [],
            selectedDataset: chartToMinimise?.selectedDataset || state.selectedDataset,
            position: position,
        },
          ...state.minimisedCharts,
        ],
        // Remove from openCharts
        openCharts: state.openCharts.filter((g) => g.chartName !== chartName)
     };
    }),

  // Remove chart from minimisedCharts by name
  removeMinimisedChart: (chartName) =>
    set((state) => ({
      minimisedCharts: state.minimisedCharts.filter((g) => g.chartName !== chartName),
    })),

  // Removes a chart from openCharts by name
  removeOpenChart: (chartName) =>
    set((state) => ({
      openCharts: state.openCharts.filter((g) => g.chartName !== chartName),
    })),

  // Finds a chart in openCharts by name
  findOpenChartFromName: (chartName) => {
    return get().openCharts.find((g) => g.chartName === chartName);
  },

    // Finds a chart in minimisedCharts by name
  findMinimisedChartFromName: (chartName) => {
    return get().minimisedCharts.find((g) => g.chartName === chartName);
  },

  // Puts the "focused" chart to the front of the openCharts array
  focusChart: (chartName) =>
    set((state) => {
      // if not already focused
      if (
        state.openCharts[0]?.chartName === chartName &&
        state.selectedDataset === state.openCharts[0]?.selectedDataset
      )
        return state; // if already focused, do nothing
      console.log("Focusing chart: ", chartName);
      const chartToFocus = state.openCharts.find(
        (g) => g.chartName === chartName,
      );
      if (!chartToFocus) return state;
      return {
        openCharts: [
          chartToFocus,
          ...state.openCharts.filter((g) => g.chartName !== chartName),
        ],
      };
    }),

  // Updates the state of a chart in openCharts by name
  updateChartState: (chartName) =>
    set((state) => ({
      openCharts: state.openCharts.map((g) =>
        g.chartName === chartName
          ? {
              ...g,
              ...{
                chartName: chartName,
                selectedAreas: [...get().selectedAreas],
                selectedDataset: get().selectedDataset,
              },
            }
          : g,
      ),
    })),

  // Returns the top chart in the stack
  getFocusedChart: () => {
    return get().openCharts[0];
  },

  // Returns the full chart stack
  getOpenCharts: () => {
    return get().openCharts;
  },

  getAllCharts: () => {
    return [...get().openCharts, ...get().minimisedCharts];
  },

  setZoom: (zoom) => set({ currentZoom: zoom }),

  updateChartLocation: (chartName: string, pos: [number, number]) => {
    set((state) => ({
      openCharts: state.openCharts.map((chart) =>
        chart.chartName === chartName ? { ...chart, position: pos } : chart
      ),
    }));
  }
}));

// gets the areaLayer for a given zoom and dataset.
const useActiveAreaLayer = (): AreaLayer | null => {
  const dataset = useAppStore((s) => s.selectedDataset);
  const zoom = useAppStore((s) => s.currentZoom);
  return resolveAreaType(dataset, zoom);
};


export { useAppStore, useActiveAreaLayer };

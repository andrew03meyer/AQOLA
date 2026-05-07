import { useActiveAreaLayer, useAppStore } from "@/app/store/AppStore";
import { useState, useEffect, useRef } from "react";
import { getAvailableCharts } from "../ChartConfig";

const useChartOrchestrator = () => {
  // AppStore Variable Refs
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const selectedAreas = useAppStore((state) => state.selectedAreas);
  const openCharts = useAppStore((state) => state.openCharts);
  const minimisedCharts = useAppStore((state) => state.minimisedCharts);

  // AppStore Method Refs
  const clearAreas = useAppStore((state) => state.clearAreas);
  const openChart = useAppStore((state) => state.openChart);
  const addAreas = useAppStore((state) => state.addAreas);
  const findOpenChartFromName = useAppStore((state) => state.findOpenChartFromName);
  const focusChart = useAppStore((state) => state.focusChart);
  const removeOpenChart = useAppStore((state) => state.removeOpenChart);
  const getFocusedChart = useAppStore((state) => state.getFocusedChart);
  const updateChartState = useAppStore((state) => state.updateChartState);
  const setDataset = useAppStore((state) => state.setDataset);

  const [activeChartId, setActiveChartId] = useState(""); // mainly used for determining if the user has changed dataset
  const availableCharts = getAvailableCharts(selectedDataset);

  // Terminology:
  //      Active chart and focused chart - mean the same thing. The chart that is to be interacted with

  // If there are no charts in either stack, ensure activeChartId is empty string
  useEffect(() => {
    if (minimisedCharts.length == 0 && openCharts.length == 0) {
      setActiveChartId("");
    }
  }, [minimisedCharts.length, openCharts.length]);

  // Update current chart and selected areas when dataset changes
  useEffect(() => {
    // Checks if the user has changed the dataset via the dropdown
    if (selectedDataset !== getFocusedChart()?.selectedDataset) {
      setActiveChartId("");
    }
  }, [selectedDataset]);

  // Update activeChart ID when stack changes
  // Keeps local ref up to date
  useEffect(() => {
    setActiveChartId(getFocusedChart()?.chartName ?? "");
  }, [openCharts]);

  // Update selected areas and dataset when active chart updates
  useEffect(() => {
    // If there is an active chart, change the dataset match
    const activeChartDataset = findOpenChartFromName(activeChartId)?.selectedDataset;
    if (activeChartDataset) {
      setDataset(activeChartDataset);
    }
    addAreas(findOpenChartFromName(activeChartId)?.selectedAreas ?? []);
  }, [activeChartId]);

  // Update chart state if the active chart's dataset is the same as the user selected dataset
  const updateLiveChart = async () => {
    if (findOpenChartFromName(activeChartId)?.selectedDataset == selectedDataset) {
      updateChartState(activeChartId);
    }
  };
  // Updates the currently active chart when selectedAreas changes
  useEffect(() => {
    if (activeChartId === getFocusedChart()?.chartName) {
      updateLiveChart();
    }
  }, [selectedAreas]);

  // Removes chart from stack, and refocuses, clears currently selected areas
  const closeChart = (chartId: string) => {
    removeOpenChart(chartId);
    setActiveChartId(getFocusedChart()?.chartName ?? "");
    clearAreas();
  };

  // Create/Focus chart based on ID
  const triggerChart = async (chartId: string) => {
    // if not in the stack, add the chart and set it as activeChartId
    if (findOpenChartFromName(chartId) === undefined) {
      const pos = 100 + (10 * openCharts.length);
      openChart(chartId, [pos, pos]);
    }
    else {
      focusChart(chartId);
    }
    setActiveChartId(chartId);
  };

  const activeLayer = useActiveAreaLayer();
  const prevAreaType = useRef(activeLayer?.areaType);

  useEffect(() => {
    // If the area type changes and there is no active chart
    // Then clear the selected areas as they won't be relevant anymore.
    if (activeLayer?.areaType !== prevAreaType.current && !activeChartId) {
      clearAreas();
      prevAreaType.current = activeLayer?.areaType ?? undefined;
    }
  }, [activeLayer?.areaType]);

  return {
    availableCharts,
    activeChartId,
    setActiveChartId,
    triggerChart,
    closeChart,
    updateLiveChart,
  };
};

export { useChartOrchestrator };

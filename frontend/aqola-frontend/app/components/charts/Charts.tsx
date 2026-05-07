import { useAppStore } from "../../store/AppStore";
import { fetchChartData, getChartDefinition } from "../../lib/ChartConfig";
import { StateDefinition } from "../../store/ChartStateModel";
import { useEffect, useRef, useState, memo } from "react";
import { useChartOrchestrator } from "../../lib/hooks/ChartOrchestrator";
import ChartWindow from "./ChartWindow";
import { ChartData } from "../../lib/ChartModels";

export default function Charts() {
    const getOpenCharts = useAppStore((state) => state.getOpenCharts);
    const focusChart = useAppStore((state) => state.focusChart);
    const minimiseChart = useAppStore((state) => state.minimiseChart);
    const openCharts = getOpenCharts() as StateDefinition[];
    const { closeChart } = useChartOrchestrator();

    // Dictionary of chart name and corresponding data
    const [chartsData, setChartsData] = useState<Record<string, ChartData>>({});
    // Ref to keep track of previously rendered charts
    const prevChartNamesRef = useRef<Set<string>>(new Set());
    // Ref to selected areas in appstore
    const selectedAreas = useAppStore((state) => state.selectedAreas);
    // Ref to previous selected areas
    const prevSelectedAreasRef = useRef<string[]>(selectedAreas);

    useEffect(() => {
        const currentCharts = new Set(openCharts.map((c) => c.chartName));
        const prevRenderedCharts = prevChartNamesRef.current;

        // Find new, removed, and updated charts
        const addedCharts = openCharts.filter((c) => !prevRenderedCharts.has(c.chartName));

        let changedCharts: StateDefinition[] = [];
        if (openCharts.length > 0) {
            changedCharts = JSON.stringify(prevSelectedAreasRef.current) == JSON.stringify(selectedAreas) ? [] : [openCharts[0]];
        }
        
        const removedCharts = [...prevRenderedCharts].filter((chart) => !currentCharts.has(chart));
        
        // Drop removed charts from the data dictionary
        if (removedCharts.length > 0) {
            const newChartData = { ...chartsData };
            removedCharts.forEach((name) => delete newChartData[name]);
            setChartsData(newChartData);
        }

        // Fetch data only for new charts
        const chartsToUpdate = new Set([...addedCharts, ...changedCharts]);
        if (chartsToUpdate.size > 0) {
            Promise.all(
                Array.from(chartsToUpdate).map(async (chart) => {
                    const data = await fetchChartData(chart.chartName, chart.selectedAreas);
                    console.log(`Fetched data for chart ${chart.chartName}:`, data);
                    return [chart.chartName, data];
                }))
            .then((chartDataToAdd) => {
                console.log("Updating chart data with:", Object.fromEntries(chartDataToAdd));
                setChartsData((prevChartData) => ({ ...prevChartData, ...Object.fromEntries(chartDataToAdd) }));
            });
        }

        // Update the ref to the current chart names
        prevChartNamesRef.current = currentCharts;
        prevSelectedAreasRef.current = selectedAreas;
    }, [openCharts]);

    return (
        <>
            {openCharts.map((chart) => {
                const data = chartsData[chart.chartName];
                if (data === undefined) return null;
                return (
                    <ChartWindow
                        key={chart.chartName}
                        chart={chart}
                        data={data}
                        zIndex={ 400 + openCharts.length - openCharts.findIndex((c) => c.chartName === chart.chartName) }
                    />
                );
            })}
        </>
    );
}
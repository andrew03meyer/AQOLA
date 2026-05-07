import { useAppStore } from "../../store/AppStore";
import { StateDefinition } from "@/app/store/ChartStateModel";

const MinimisedChartList = () => {
    const charts = useAppStore((state) => state.minimisedCharts);
    const openChart = useAppStore((state) => state.openChart);
    const removeMinimisedChart = useAppStore((state) => state.removeMinimisedChart);

    const removeFunction = (e: any, chartName: string) => {
        e.stopPropagation()
        removeMinimisedChart(chartName);
    };

    return (
        <>
            {[...charts].reverse().map((chart: StateDefinition) => (
                <div key={chart.chartName} className="minimised-element" onClick={() => openChart(chart.chartName, [0, 0])}>
                    <div id="minimised-element-text" className="minimised-text">
                        {chart.chartName}
                    </div>
                    <div onClick={(e) => removeFunction(e, chart.chartName)} className="minimised-close">
                        ✕
                    </div>
                </div>
            ))}
        </>
    );
};

export default MinimisedChartList;
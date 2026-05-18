import { useChartOrchestrator } from "../lib/hooks/ChartOrchestrator";

const ChartControls = () => {
  const { availableCharts, activeChartId, triggerChart } = useChartOrchestrator();
  return (
    <div className="bottom-nav">
      {availableCharts.map((chart) => (
        <img 
          src={chart.src}           
          key={chart.id}
          onClick={() => triggerChart(chart.id)}
          className={`nav-button ${activeChartId === chart.id ? "active" : ""}`}
          title={chart.id}
        />
      ))}
    </div>
  );
};

export { ChartControls };

import { useChartOrchestrator } from "../lib/hooks/ChartOrchestrator";
import { Tooltip } from "react-tooltip";

const ChartControls = () => {
  const { availableCharts, activeChartId, triggerChart } = useChartOrchestrator();
  return (
    <div className="bottom-nav" id="bottom-nav-bar">
      {availableCharts.map((chart) => (
        <div data-tooltip-id={chart.id+"-tooltip"} key={chart.id+"-key"}>
          <img 
            id= {chart.id+"-img"}
            src={chart.src}           
            key={chart.id}
            onClick={() => triggerChart(chart.id)}
            className={`nav-button ${activeChartId === chart.id ? "active" : ""}`}
            // title={chart.id}
          />
          <Tooltip
            id={chart.id+"-tooltip"}
            className="tooltip"
            style={{ 
                // maxWidth: "50%", 
                borderRadius:"10px",
                zIndex: 4000
            }}
            // delayHide={500}
            content={chart.id.replaceAll("_", " ")}
          />
        </div>
      ))}
    </div>
  );
};

export { ChartControls };

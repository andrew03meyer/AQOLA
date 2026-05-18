import { Rnd } from 'react-rnd';
import { ReactNode } from 'react';
import { useAppStore } from '../store/AppStore'
import InformationIcon from "./InformationIcon"
import { getChartDefinition } from '../lib/ChartConfig';

interface WindowProps {
  children: ReactNode
  chartName: string;
  zIndex: number;
}

const Window = ({ children, chartName, zIndex  }: WindowProps) => {

  const removeOpenChart = useAppStore((state) => state.removeOpenChart);
  const focusChart = useAppStore((state) => state.focusChart);
  const minimiseChart = useAppStore((state) => state.minimiseChart);
  const updateChartLocation = useAppStore((state) => state.updateChartLocation);
  const findOpenChartFromName = useAppStore((state) => state.findOpenChartFromName);
  const openCharts = useAppStore((state) => state.openCharts);

  const chart = findOpenChartFromName(chartName);
  const [x, y] = chart ? chart.position : [100 + (10 * openCharts.length), 100 + (10 * openCharts.length)];
  

  return (
    <Rnd
      default={{ x: x, y: y, width: "66%", height: 480 }}
      bounds="parent"
      style={{ zIndex: zIndex }}
      className="rnd-window"
      dragHandleClassName="window-titlebar"
      onDragStop={(_, data) => updateChartLocation && updateChartLocation(chartName, [data.x, data.y])} // Update chart location on drag end
    >
      {/* Top bar of the window, includes close button */}
      <div className="window-titlebar">
        <InformationIcon content={getChartDefinition(chartName)}/>
        <button onClick={() => minimiseChart && minimiseChart(chartName, [x, y])}> - </button>
        <button onClick={() => removeOpenChart(chartName)}> ✕ </button>
      </div>

      {/* Window contents */}
      <div 
        className="window-content"
        style={{
          width: "95%",
          height: "90%",
          padding:"0%",
          margin: "0%",
          position: "absolute"
        }}
        onMouseDown={() => focusChart && focusChart(chartName)} // For focusing element on click
      > 
        { children } 
      </div>
    </Rnd>
  );
};

export { Window };
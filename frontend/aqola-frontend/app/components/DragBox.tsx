import { Rnd } from "react-rnd";
import { ReactNode, use, useState } from "react";
import { useAppStore } from "../store/AppStore";
import InformationIcon from "./InformationIcon";
import { getChartDefinition } from "../lib/ChartConfig";
import { Eraser } from "lucide-react";
import { Tooltip } from "react-tooltip";

interface WindowProps {
  children: ReactNode;
  chartName: string;
  zIndex: number;
}

const Window = ({ children, chartName, zIndex }: WindowProps) => {
  const removeOpenChart = useAppStore((state) => state.removeOpenChart);
  const focusChart = useAppStore((state) => state.focusChart);
  const minimiseChart = useAppStore((state) => state.minimiseChart);
  const updateChartLocation = useAppStore((state) => state.updateChartLocation);
  const findOpenChartFromName = useAppStore(
    (state) => state.findOpenChartFromName,
  );
  const getFocusedChart = useAppStore((state) => state.getFocusedChart);
  const openCharts = useAppStore((state) => state.openCharts);
  const clearAreas = useAppStore((state) => state.clearAreas);
  const updateChartState = useAppStore((state) => state.updateChartState);
  const clearChartState = useAppStore((state) => state.clearChartState);
  const toggleDatasetWideEditing = useAppStore(
    (state) => state.toggleDatasetWideEditing,
  );
  const datasetWideEditing = useAppStore((state) => state.datasetWideEditing);

  const chart = findOpenChartFromName(chartName);
  const [x, y] = chart
    ? chart.position
    : [100 + 10 * openCharts.length, 100 + 10 * openCharts.length];

  return (
    <Rnd
      default={{ x: x, y: y, width: "50%", height: "50%" }}
      bounds="parent"
      style={{ zIndex: zIndex }}
      className="rnd-window"
      dragHandleClassName="window-titlebar"
      onDrag={() => focusChart(chartName)}
      onDragStop={(_, data) =>
        updateChartLocation && updateChartLocation(chartName, [data.x, data.y])
      } // Update chart location on drag end
    >
      {/* Top bar of the window, includes close button */}
      <div className="window-titlebar">
        <InformationIcon content={getChartDefinition(chartName)} />
        <Eraser
          data-tooltip-id={chartName + "eraser-tooltip"}
          onClick={() => {
            // let editingChanged = false;

            // if (datasetWideEditing) {
            //   toggleDatasetWideEditing();
            //   editingChanged = true;
            // }

            focusChart(chartName);

            // clearAreas()
            clearChartState(chartName);
            // updateChartState(chartName)

            // if (editingChanged) {
            //   toggleDatasetWideEditing();
            //   editingChanged = false;
            // }
          }}
          className="titlebar-contents"
          style={
            {
              // visibility: getFocusedChart()?.chartName === chartName ? "visible" : "hidden"
            }
          }
        />
        <Tooltip
          id={chartName + "eraser-tooltip"}
          className="tooltip"
          style={{
            maxWidth: "50%",
            borderRadius: "10px",
            zIndex: 4000,
          }}
          delayHide={500}
          content="Clear areas for this chart"
        />

        <button
          onClick={() => minimiseChart && minimiseChart(chartName, [x, y])}
        >
          {" "}
          -{" "}
        </button>
        <button onClick={() => removeOpenChart(chartName)}> ✕ </button>
      </div>

      {/* Window contents */}
      <div
        className="window-content"
        style={{
          width: "95%",
          height: "90%",
          padding: "0%",
          margin: "0%",
          position: "absolute",
        }}
        onMouseDown={() => focusChart && focusChart(chartName)} // For focusing element on click
      >
        {children}
      </div>
    </Rnd>
  );
};

export { Window };

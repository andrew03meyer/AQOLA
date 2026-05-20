export type BarChartResponse = {
  chartType: "bar";
  type: string;
  area: string;
  chart: {
    groups: {
      name: string;
      bars: {
        bar_name: string;
        value: number;
        color: string;
      }[];
    }[];
    title: string;
    xlabel: string;
    ylabel: string;
    scaleType: string;
  };
};

export type LineChartResponse = {
  chartType: "line";
  type: string;
  area: string;
  chart: {
    lines: {
      line_name: string;
      coords: [Date, number][];
      color: string;
    }[];
    title: string;
    xlabel: string;
    ylabel: string;
  };
};

export type SpiderDiagramResponse = {
  chartType: "spider";
  type: string;
  area: string;
  chart: {
    groups: {
      axis: string;
      value: number;
    }[][];
    title: string;
  };
};

// export type SpiderDiagramResponse = { axis: string; value: number; }[][];

export type ChartData =
  | BarChartResponse
  | LineChartResponse
  | SpiderDiagramResponse
  | null;
// type for determining which chart button is clicked
export type ChartType =
  | "line_over_time"
  | "bar_frequency"
  | "api_bar"
  | "line_over_time_by_lsoa";

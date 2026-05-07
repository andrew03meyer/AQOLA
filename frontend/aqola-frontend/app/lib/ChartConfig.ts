import datasetConfig from "../store/datasetConfig.json";
import chartDefinitions from "../store/chartDefinitions.json";
import { crime_rate_by_type_and_area, crime_rate_over_time } from "./LineChart";
import {
  ofsted_frequency_by_band,
  ofsted_frequency_yearly,
  school_gender_demographics_by_phase,
  flood_risk_frequency_by_postcode,
  crime_rate_by_lsoa,
  crime_rate_by_lsoa_cumulative,
} from "./BarChart";
import { ChartData } from "./ChartModels";
import { get_school_ofsted_history } from "./LineChart";
import { flood_risk_frequency_by_postcode_spider } from "./SpiderDiagram";

type DatasetKey = keyof typeof datasetConfig;

// Maps the apiCall part of the chart info to the actual API function
// Every chart will need a new line here to get the data needed to populate the chart.

// apiCall (in the json) : (params) => actual_function_in_frontend(params);

const apiCallMap: Record<string, (areas: string[]) => Promise<ChartData>> = {
  
// =============================================================================================
  // Crime API calls
// =============================================================================================
    // Line Graphs
  crime_rate_by_type_and_area: (areas) =>
    crime_rate_by_type_and_area((areas[areas.length-1]), ["Anti-social behaviour","Bicycle theft","Burglary","Criminal damage and arson","Other theft","Robbery","Shoplifting","Theft from the person","Violence and sexual offences"]), // areas[0]
  crime_rate_over_time: (areas) => crime_rate_over_time(areas),
  
  //Bar Graphs
  crime_rate_by_lsoa: (areas) => crime_rate_by_lsoa(areas),
  crime_rate_by_lsoa_cumulative: (areas) => crime_rate_by_lsoa_cumulative(areas),


// =============================================================================================
  //School API calls
// =============================================================================================

  ofsted_frequency_by_band: () => ofsted_frequency_by_band(),
  ofsted_frequency_yearly: () => ofsted_frequency_yearly(),
  school_gender_demographics_by_phase: () =>
    school_gender_demographics_by_phase(),
  get_school_ofsted_history: (areas) => get_school_ofsted_history(areas),

  flood_risk_frequency_by_postcode: (areas) =>
    flood_risk_frequency_by_postcode(areas),
  flood_risk_frequency_by_postcode_spider: (areas) =>
    flood_risk_frequency_by_postcode_spider(areas),
};

// Gets available charts from datasetConfig.json
const getAvailableCharts = (dataset: string) => {
  dataset = dataset.toLowerCase();

  const graphIds = (
    datasetConfig as Record<DatasetKey, Record<"graphs", string[]>>
  )[dataset as DatasetKey] ?? { graphs: [] };
  return chartDefinitions.filter((g) => graphIds.graphs.includes(g.id)) ?? null;
};

// Runs data fetch for inputted chart id
const fetchChartData = async (
  chartId: string | undefined,
  selectedAreas: string[] | undefined,
) => {
  if (chartId === undefined || selectedAreas === undefined) {
    return null;
  }

  //Find relevant chart
  const chart = chartDefinitions.find((c) => c.id === chartId);
  if (!chart) throw new Error(`Unkown Chart id: ${chartId}`);

  //Find relevant function
  const apiFn = apiCallMap[chart.apiCall];
  if (!apiFn) throw new Error(`No API function mapped for: ${chart.apiCall}`);

  //Run function
  const data = await apiFn(selectedAreas)
  console.log(data)
  return data;
};

// Retrieve the chart definition given an ID, from the chartDefinition JSON
const getChartDefinition = (chartId: string | undefined) => {
  if (chartId === undefined) return null;
  const chart = chartDefinitions.find((c) => c.id === chartId);
  if (!chart) return null;
  return chart;
};

export {
  getAvailableCharts,
  fetchChartData,
  getChartDefinition,
  type DatasetKey,
};

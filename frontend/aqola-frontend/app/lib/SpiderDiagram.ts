import type { SpiderDiagramResponse } from "./ChartModels"
import axios from "axios";
import { COLOR } from "./constants";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
});

export const flood_risk_frequency_by_postcode_spider = async (
  postcodes: string[],
): 
  Promise<SpiderDiagramResponse> => {
  
  // When there are no postcodes selected, return an empty object
  if (postcodes.length == 0){
    return (
    {
      chartType: "spider",
      type: "flood_data",
      area: "postcode",
      chart: {
        groups: [[{
          axis: "",
          value: 0
          }]],
          title: "Kent Postcode Flood Risks",
        },
    })
  }

  const response = await api.get(`/flood`, {
    params: {
      postcodes: postcodes,
    },
    paramsSerializer: (params) => {
      return params.postcodes.map((p: string) => `postcodes=${p}`).join("&");
    },
  });

  const groups = response.data.map((group: any, i: number) => {
    const keys = Object.keys(group).filter((k) => k !== "postcode" && k !== "frs_band");
    const vals = keys.map((k) => ({
      plot_name: group.postcode,
      axis: k,
      value: group[k],
      color: COLOR[i]
    }));

    return vals;
  });

  const spider_return: SpiderDiagramResponse = {
    chartType: "spider",
    type: "flood_data",
    area: "postcode",
    chart: {
      groups,
      title: "Kent Postcode Flood Risks",
    },
  };
  return spider_return;
};

import { stringify } from "querystring";
import type { Crime, CrimeTypes, UniqueMonths } from "./ApiModels";
import type { LineChartResponse } from "./ChartModels";
import axios from "axios";
import type { School } from "./ApiModels"
import { COLOR } from "./constants"

// method naming convention <area>_<xlabel>_<ylabel>_<lines>

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Gets crime rate for:
//      specific lsoa (string) - required
//      crime type (list of strings) - optional
// returns a graph of crime rate over time in an lsoa
// Each line represents a crime type

// =============================================================================================
//       CURRENTLY NOT WORKING CORRECTLY - NEEDS TO BE UPDATED TO TAKE MULTIPLE LSOAs
// =============================================================================================
export const crime_rate_by_type_and_area = async (
  lsoa: string,
  crimeTypes?: string[],
): Promise<LineChartResponse> => {
  let crimeTypeSlug: string = "";

let colorMap: Record<string, string> = {
  "Anti-social behaviour": COLOR[0],
  "Bicycle theft": COLOR[1],
  "Burglary": COLOR[2],
  "Criminal damage and arson": COLOR[3],
  "Drugs": COLOR[4],
  "Other crime": COLOR[5],
  "Other theft": COLOR[6],
  "Possession of weapons": COLOR[7],
  "Public order": COLOR[8],
  "Robbery": COLOR[9],
  "Shoplifting": COLOR[10],
  "Theft from the person": COLOR[11],
  "Vehicle crime": COLOR[12],
  "Violence and sexual offences": COLOR[13],
};

  if (!lsoa) {
    return {
      chartType: "line",
      type: "crime_data",
      area: "postcode",
      chart: {
        lines: [],
        title: "Crime Rate by Type (Over Time)",
        xlabel: "Months",
        ylabel: "Number of Crimes",
      }
    } as LineChartResponse;
  }

  if (crimeTypes){
    crimeTypeSlug = "?"
    for (let type of crimeTypes){
      crimeTypeSlug += `crimeType=${type}&`
    }
    crimeTypeSlug = crimeTypeSlug.substring(0, crimeTypeSlug.length - 1);
  }

  const apiResponse = await api.get(
    `/crime/timeseries/${crimeTypeSlug}&lsoas=${lsoa}`,
  );
  const crimeCountData = apiResponse.data;

  let lines: { line_name: string; coords: [Date, number][]; color: string }[] =
    [];

  for (const [crimeType, coords] of Object.entries(crimeCountData)) {
    lines.push({
      line_name: crimeType,
      coords: (coords as [Date, number][]).map(([date, count]) => [new Date(date), count]),
      color: colorMap[crimeType]
    });
  }

  const response: LineChartResponse = {
    chartType: "line",
    type: "crime_data",
    area: "postcode",
    chart: {
      lines,
      title: "Crime Rate by Type (Over Time)",
      xlabel: "Months",
      ylabel: "Number of Crimes",
    },
  };

  return response;
};

// Gets total crime rate over multiple lsoas
// Returns a graph of total crime rate over time
// Each line is an lsoa
export const crime_rate_over_time = async (lsoas : string[]) : Promise<LineChartResponse> => {
  let lsoaSlug : string = "";

  if (lsoas.length >= 1){
    lsoaSlug = "?"
    for (let lsoa of lsoas){
      lsoaSlug += `lsoas=${lsoa}&`
    }
    lsoaSlug = lsoaSlug.substring(0, lsoaSlug.length - 1);
  }
  else{
    return (
      {
        chartType: "line",
        type: "crime_data",
        area: "postcode",
        chart: {
          lines: [],
          title: "Crime Rate Over Time",
          xlabel: "Months",
          ylabel: "Number of Crimes",
        },
      }
    )
  }

  const apiResponse = await api.get(`/crime/crime-rate-total/${lsoaSlug}`);
  const crimeCountData = apiResponse.data;

  let lines: { line_name: string; coords: [Date, number][]; color: string }[] =
    [];

for (const [index, [lsoa, coords]] of Object.entries(crimeCountData).entries()) {
  lines.push({
      line_name: lsoa,
      coords: (coords as [Date, number][]).map(([date, count]) => [new Date(date), count]),
      color: COLOR[index % COLOR.length]
    });
  }

  const response: LineChartResponse = {
    chartType: "line",
    type: "crime_data",
    area: "postcode",
    chart: {
      lines,
      title: "Crime Rate Over Time",
      xlabel: "Months",
      ylabel: "Number of Crimes",
    },
  };

  return response;
};

export const get_school_ofsted_history = async (
  urn: string[],
): Promise<LineChartResponse> => {
  // regex filter to remove anything that isn't exactly a 6-digit number (URN)
  const validUrns = urn ? urn.filter((id) => /^\d{6}$/.test(String(id))) : [];

  if (validUrns.length === 0) {
    return {
      chartType: "line",
      type: "school_data",
      area: "school",
      chart: {
        lines: [],
        title: "Please select a school on the map",
        xlabel: "Year",
        ylabel: "Ofsted Ranking",
      },
    };
  }

  const urnSlug = "?" + validUrns.map((u) => `urns=${u}`).join("&");
  const apiResponse = await api.get(`/school/${urnSlug}`);

  const schoolRecords: School[] = apiResponse.data;

  // Group records by URN (falling back to school_name if urn isn't on the model)
  const recordsByUrn = schoolRecords.reduce<Record<string, School[]>>(
    (acc, record) => {
      const key = (record as any).urn ?? record.school_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    },
    {},
  );

  const lines = Object.values(recordsByUrn).map((records, i) => {
    const coords: [Date, number][] = records
      .filter((s) => s.ofsted_ranking > 0 && s.ofsted_ranking <= 4)
      .map((s) => {
        const startYear = s.year_range.split("-")[0];
        return [new Date(`${startYear}-01-01`), s.ofsted_ranking] as [
          Date,
          number,
        ];
      })
      .sort((a, b) => a[0].getTime() - b[0].getTime());

    return {
      line_name: records[0]?.school_name || "Unknown School",
      coords,
      color: COLOR[i % COLOR.length],
    };
  });

  const title =
    lines.length === 1
      ? `Ofsted Rating History: ${lines[0].line_name}`
      : "Ofsted Rating History: School Comparison";

  return {
    chartType: "line",
    type: "school_data",
    area: "school",
    chart: {
      lines,
      title,
      xlabel: "Year",
      ylabel: "Ofsted Ranking",
    },
  };
};

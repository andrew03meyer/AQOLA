import axios from "axios";
import type {
  YearlyOfstedResponse,
  GenderDemographicsResponse,
} from "./PolygonModels";
import type { SchoolCounts } from "./ApiModels";
import type { BarChartResponse } from "./ChartModels";
import { COLOR } from "./constants"

// method naming convention <area>_<xlabel>_<ylabel>_<bars>

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const get_bar_info = async () => {
  const response = await api.get("/school/?lsoas=E01024135");
  return response.data;
};

// Number of schools in each ofsted band for all of Kent
export const ofsted_frequency_by_band = async (): Promise<BarChartResponse> => {
  const apiResponse = await api.get<SchoolCounts>("/school/ofsted-count");

  const scores = apiResponse.data;

  const rankingCounts = Object.fromEntries(
    scores.ofsted_rankings.map((school) => [school.ranking, school.count]),
  );

  const response: BarChartResponse = {
    chartType: "bar",
    type: "school_data",
    area: "county",

    chart: {
      groups: [
        {
          name: "Kent School Performance",
          bars: [
            {
              bar_name: "Outstanding",
              value: rankingCounts[1] ?? 0,
              color: "green",
            },
            {
              bar_name: "Good",
              value: rankingCounts[2] ?? 0,
              color: "blue",
            },
            {
              bar_name: "Needs Improvement",
              value: rankingCounts[3] ?? 0,
              color: "orange",
            },
            {
              bar_name: "Inadequate",
              value: rankingCounts[4] ?? 0,
              color: "red",
            },
            {
              bar_name: "Ungraded",
              value: (rankingCounts[0] ?? 0) + (rankingCounts[-1] ?? 0),
              color: "grey",
            },
          ],
        },
      ],
      title: "Kent Ofsted Performance",
      xlabel: "Ofsted Rating",
      ylabel: "Number of Schools",
    },
  };

  return response;
};

// Number of schools in each ofsted band for all of Kent from 2012 - 2025 academic years
export const ofsted_frequency_yearly = async (
  area?: string,
): Promise<BarChartResponse> => {
  const apiResponse = await api.get<YearlyOfstedResponse>(
    "/school/ofsted-count-yearly",
  );

  const rawData = apiResponse.data.yearly_rankings;

  const uniqueYears = Array.from(
    new Set(rawData.map((d) => d.year_range)),
  ).sort();

  const groups = uniqueYears.map((year) => {
    const yearData = rawData.filter((d) => d.year_range === year);

    const rankingCounts = Object.fromEntries(
      yearData.map((row) => [row.ranking, row.count]),
    );

    return {
      name: year, // This becomes the label on the X-axis (e.g., "2012-2013")
      bars: [
        {
          bar_name: "Outstanding",
          value: rankingCounts[1] ?? 0,
          color: "green",
        },
        { bar_name: "Good", value: rankingCounts[2] ?? 0, color: "cyan" },
        {
          bar_name: "Needs Improvement",
          value: rankingCounts[3] ?? 0,
          color: "blue",
        },
        {
          bar_name: "Inadequate",
          value: rankingCounts[4] ?? 0,
          color: "brown",
        },
        {
          bar_name: "Ungraded",
          value: (rankingCounts[0] ?? 0) + (rankingCounts[-1] ?? 0),
          color: "grey",
        },
      ],
    };
  });

  const response: BarChartResponse = {
    chartType: "bar",
    type: "kent_ofsted_yearly",
    area: "county",
    chart: {
      groups: groups, // Pass in array of yearly groups
      title: "Kent Ofsted Rankings (Over Time)",
      xlabel: "Academic Year",
      ylabel: "Number of Schools",
    },
  };

  return response;
};

// Demographics of schools broken down by phase and gender for all of Kent
export const school_gender_demographics_by_phase = async (
  area?: string,
): Promise<BarChartResponse> => {
  const apiResponse = await api.get<GenderDemographicsResponse>(
    "/school/gender-demographics-count",
  );

  const rawData = apiResponse.data["gender-demographics"];

  // Ordering to make sure x axis education phases are chronological
  const phaseOrder = ["Primary", "Secondary", "16 to 18"];
  const uniquePhases = Array.from(new Set(rawData.map((d) => d.phase))).sort(
    (a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b),
  );

  // Hardcoded UI colours mapped to specific data keys to be representative of gender
  const genderColours: Record<string, string> = {
    Boys: "#3b82f6", // Blue
    Girls: "#ec4899", // Pink
    Mixed: "#a855f7", // Purple
  };

  const groups = uniquePhases.map((phase) => {
    const phaseData = rawData.filter((d) => d.phase === phase);

    const bars = phaseData.map((d) => ({
      bar_name: d.gender,
      value: d.count,
      color: genderColours[d.gender] || "grey",
    }));

    return {
      name: phase,
      bars: bars,
    };
  });

  const response: BarChartResponse = {
    chartType: "bar",
    type: "school_demographics",
    area: area ? "local" : "county",
    chart: {
      groups: groups,
      title: "School Gender Demographics by Phase",
      xlabel: "Education Phase",
      ylabel: "Number of Schools",
      scaleType: "symlog",
    },
  };

  return response;
};

export const flood_risk_frequency_by_postcode = async (
  postcodes: string[],
): Promise<BarChartResponse> => {
  if (postcodes.length == 0) {
    return {
      chartType: "bar",
      type: "flood_data",
      area: "postcode",

      chart: {
        groups: [
          {
            name: "null",
            bars: [
              {
                bar_name: "none",
                value: 0,
                color: "black",
              },
            ],
          },
        ],
        title: "Kent Postcode Flood Risks",
        xlabel: "Postcodes",
        ylabel: "Number of Houses",
      },
    };
  }

  const response = await api.get(`/flood`, {
    params: {
      postcodes: postcodes,
    },
    paramsSerializer: (params) => {
      return params.postcodes.map((p: string) => `postcodes=${p}`).join("&");
    },
  });

  const groups = response.data.map((group: any) => ({
    name: group.postcode,
    bars: [
      { bar_name: "High Risk", value: group.frs_count_high, color: "red" },
      {
        bar_name: "Medium Risk",
        value: group.frs_count_medium,
        color: "orange",
      },
      { bar_name: "Low Risk", value: group.frs_count_low, color: "yellow" },
      {
        bar_name: "Very Low Risk",
        value: group.frs_count_very_low,
        color: "green",
      },
    ],
  }));

  const bar_return: BarChartResponse = {
    chartType: "bar",
    type: "flood_data",
    area: "postcode",

    chart: {
      groups,
      title: "Kent Postcode Flood Risks",
      xlabel: "Postcodes",
      ylabel: "Number of Houses",
    },
  };
  return bar_return;
};

// Show crime rates per lsoa (split up into each crime type)
export const crime_rate_by_lsoa = async(lsoas: string[]): Promise<BarChartResponse> => {
  // Check if postcodes is empty
  if (lsoas.length == 0){
    return (
    {
      chartType: "bar",
      type: "crime",
      area: "lsoa",

      chart: {
        groups: [{
          name: "null",
          bars: [{
            bar_name: "none",
            value: 0,
            color: "black",
          }]
        }],
        title: "Crime Rate by LSOA (over all time)",
        xlabel: "Crime Type per LSOA",
        ylabel: "Number of Crimes",
      }
    })
  }

  const response = await api.get("/crime/crime-rate-by-type", {
    params: {
      lsoas: lsoas,
    },
    paramsSerializer: (params) => {
      return params.lsoas.map((p: string) => `lsoas=${p}`).join("&");
    },
  });

  // Initialisation of crime types set to 0
  const crime_types = await api.get("/crime/types");
  const all_types: string[] = crime_types.data.values;

  // Dictionary: per lsoa, per crime type, havea  count
  const crime_counts: Record<string, Record<string, number>> = {};

  Object.entries(response.data).forEach(([lsoa, crimes]) => {
    // for each lsoa, add the crime types and set their counts to 0
    crime_counts[lsoa] = Object.fromEntries(all_types.map((type) => [type, 0]));

    // All crime types found in the response overwrite the 0 value with actual count
    (crimes as [string, number][]).forEach(([crime_type, count]) => {
      crime_counts[lsoa][crime_type] = count;
    });
  });

  // Formatting the results to match response model
  const groups = Object.entries(crime_counts).map(([lsoa, crime]) => ({
    name: lsoa,
    bars: Object.entries(crime).map(([crime_type, _], i) => ({
      bar_name: crime_type,
      value: crime_counts[lsoa][crime_type],
      color: COLOR[i % COLOR.length]
    }))
  }))

  // Create bar response
  const bar_return: BarChartResponse = {
    chartType: "bar",
    type: "crime",
    area: "lsoa",
    chart: {
      groups,
      title: "Crime Rate by LSOA (over all time)",
      xlabel: "LSOAs",
      ylabel: "Number of Crimes",
    },
  };

  return bar_return;
}

// Counts the number of crimes in each type, cumulatively (across lsoas)
export const crime_rate_by_lsoa_cumulative = async(lsoas: string[]): Promise<BarChartResponse> => {
  // Check if postcodes is empty
  if (lsoas.length == 0){
    return (
    {
      chartType: "bar",
      type: "crime",
      area: "lsoa",

      chart: {
        groups: [{
          name: "null",
          bars: [{
            bar_name: "none",
            value: 0,
            color: "black",
          }]
        }],
        title: "Cumulative Crime Rate Across LSOAs (over all time)",
        xlabel: "Crime Types",
        ylabel: "Number of Crimes",
      }
    })
  }

  const response = await api.get("/crime/crime-rate-by-type", {
    params: {
      lsoas: lsoas,
    },
    paramsSerializer: (params) => {
      return params.lsoas.map((p: string) => `lsoas=${p}`).join("&");
    },
  });

  // Get all crime types
  const crime_totals: Record<string, number> = {}
  const crime_types = await api.get("/crime/types")
  // Initialise the crime counts to 0 - means all types are accounted for
  crime_types.data.values.forEach((type : string) => crime_totals[type] = 0)

  // Add the response values to the pre-initialised values
  Object.entries(response.data).map(([_, crime]) => (
    (crime as [string, number][]).map(([crime_type, count]) => {
      crime_totals[crime_type] += count
  })))

  const groups = [{
    name: "Cumulative Crime Rate",
    bars: Object.entries(crime_totals).map(([crime_type, value], i) => ({
      bar_name: crime_type,
      value: value,
      color: COLOR[i % COLOR.length],
    })),
  }];

  const bar_return: BarChartResponse = {
    chartType: "bar",
    type: "crime",
    area: "lsoa",

    chart: {
      groups,
      title: "Cumulative Crime Rate Across LSOAs (over all time)",
      xlabel: "Crime Types",
      ylabel: "Number of Crimes",
    },
  };

  return bar_return;
}

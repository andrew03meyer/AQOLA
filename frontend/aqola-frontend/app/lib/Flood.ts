import { api } from "./Api";
import { FloodGeoJson, FloodPolygonResponse } from "./PolygonModels";

export const getFloodBoundaries = async (): Promise<FloodGeoJson[]> => {
  const response = await api.get(`/flood-occurrences/`);

  console.log("found " + response.data.length + "  floods");
  console.log(response.data[0].boundary);
  console.log(response.data[0].rec_out_id);

  return response.data.map((item: FloodPolygonResponse) => ({
    type: "Feature" as const,
    geometry: item.boundary,
    properties: {
      rec_out_id: item.rec_out_id,
    },
  }));
};

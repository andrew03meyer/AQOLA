import { api } from "./Api";
import { FloodGeoJson, FloodPolygonResponse } from "./PolygonModels";
import { getPostcodeBoundaries } from "./Postcode";

type BoundsParams = {
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
};

export const getFloodBoundaries = async (
  bounds: BoundsParams,
): Promise<FloodGeoJson[]> => {
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

import { GeoJSON, useMapEvents } from "react-leaflet";
import { PostcodeGeoJson } from "@/app/lib/PolygonModels";
import { useEffect, useRef, useState } from "react";
import { Feature, FeatureCollection } from "geojson";
import { useActiveAreaLayer, useAppStore } from "@/app/store/AppStore";
import { debounce } from "lodash";
import { getPostcodeBoundaries } from "@/app/lib/Postcode";
import { getLsoaBoundaries } from "@/app/lib/Lsoa";
import { DomEvent, Layer } from "leaflet";
import { getFloodBoundaries } from "@/app/lib/Flood";

interface PolygonProps {
  postcode_name: string;
  color: string;
  postcode_boundary_data: PostcodeGeoJson;
  isSelected?: boolean;
}

const Polygon = ({
  postcode_name,
  color,
  postcode_boundary_data,
  isSelected,
}: PolygonProps) => {
  return (
    <GeoJSON
      key={`${postcode_name}-${isSelected}`} // forces re-render when style changes
      data={postcode_boundary_data}
      style={{
        fillColor: isSelected ? "#66b6bd" : color,
        fillOpacity: isSelected ? 0.4 : 0.1,
        color: "#66b6bd",
        weight: isSelected ? 2 : 0.5,
      }}
    />
  );
};

const Polygons = () => {
  const [boundaries, setBoundaries] = useState<FeatureCollection | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const selectedAreas = useAppStore((state) => state.selectedAreas);
  const toggleArea = useAppStore((state) => state.toggleArea);
  const selectedAreasRef = useRef<string[]>([]);

  // This hook updates when zoom or dataset changes in appstore.
  // Active Layers is a object that has a
  //  - AreaType - postcode, lsoa, etc.
  //  - MinZoom - 8, 12, 14, etc.
  //  - MaxZoom (optional) - 12, 13, 15, etc.
  const activeLayer = useActiveAreaLayer();

  useEffect(() => {
    selectedAreasRef.current = selectedAreas;
  }, [selectedAreas]);

  const fetchBoundaries = useRef(
    // Takes in the bounding box around the screen and area type.
    debounce((bounds, areaType) => {
      // If no area type, then no polygons show
      if (!areaType) {
        setBoundaries(null);
        return;
      }

      // Different API calls based on areaType.
      // Bounds used to get only the polygons showing on the screen.
      let boundaries;
      if (areaType === "postcode") {
        boundaries = getPostcodeBoundaries({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        });
      } else if (areaType === "lsoa") {
        boundaries = getLsoaBoundaries({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        });
      } else if (areaType === "flood") {
        boundaries = getFloodBoundaries({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        });
      }

      // If we can't find the boundaries from the API
      if (!boundaries) {
        console.error("Unsupported area type: " + areaType);
        setBoundaries(null);
        return;
      }

      // Make a feature collection, can later map over it to render polygons.
      boundaries.then((data) => {
        setBoundaries({
          type: "FeatureCollection",
          features: data,
        });
        setUpdateCount((c) => c + 1);
      });
    }, 300),
  ).current;

  // When map moves or zooms, get the geometries from the API.
  // Passes in areaType and the
  // Boundary of the map (I.e. The corners of the map where the screen lies)
  const map = useMapEvents({
    moveend: () => {
      // const zoom = map.getZoom();
      // setZoom(zoom);
      fetchBoundaries(map.getBounds(), activeLayer?.areaType ?? null);
    },
    zoomend: () => {
      // const zoom = map.getZoom();
      // setZoom(zoom);
      fetchBoundaries(map.getBounds(), activeLayer?.areaType ?? null);
    },
  });

  // When the active layer changes (e.g. from postcode to lsoa), fetch the new boundaries.
  useEffect(() => {
    fetchBoundaries(map.getBounds(), activeLayer?.areaType ?? null);
  }, [activeLayer?.areaType]);

  const getStyle = (areaName: string) => {
    const isSelected = selectedAreas.includes(areaName);
    return {
      fillColor: isSelected ? "#000000" : "#b9e0ea",
      fillOpacity: isSelected ? 0.8 : 0.2,
      weight: 0.5,
    };
  };

  // For each polygon, bind a tooltip and click/hover events.
  const onEachFeature = (feature: Feature, layer: Layer) => {
    const areaName =
      feature.properties?.postcode ||
      feature.properties?.lsoa ||
      feature.properties?.rec_out_id?.toString() ||
      "Unknown";

    if (areaName) {
      layer.bindTooltip(areaName, {
        permanent: false, // only show on hover
        direction: "center",
        className: "polygon-tooltip",
      });
    }
    layer.on({
      // On hover, if not selected, change style to highlight. On mouse out, revert style if not selected.
      mouseover: (e) => {
        if (selectedAreasRef.current.includes(areaName)) return;
        e.target.setStyle({
          fillColor: "#89c4d4",
          fillOpacity: 0.8,
          weight: 0.5,
        });
      },
      mouseout: (e) => {
        if (selectedAreasRef.current.includes(areaName)) return;
        e.target.setStyle({
          fillColor: "#b9e0ea",
          fillOpacity: 0.2,
          weight: 0.5,
        });
      },

      // On click, toggle selection and update style accordingly.
      click: (e) => {
        DomEvent.stopPropagation(e);
        const isSelected = selectedAreasRef.current.includes(areaName);
        toggleArea(areaName);
        e.target.setStyle(
          isSelected
            ? { fillColor: "#b9e0ea", fillOpacity: 0.2, weight: 0.5 }
            : { fillColor: "#000000", fillOpacity: 0.8, weight: 0.5 },
        );
      },
    });
  };

  // If no boundaries, don't render anything.
  if (!boundaries) {
    return null;
  }

  return (
    <GeoJSON
      key={updateCount} // forces re-render when boundaries change
      data={boundaries}
      style={(feature) => {
        if (feature) {
          const areaName =
            feature.properties?.postcode ||
            feature.properties?.lsoa ||
            feature.properties?.rec_out_id?.toString() ||
            "Unknown";
          return getStyle(areaName);
        } else {
          return {};
        }
      }}
      onEachFeature={onEachFeature}
    />
  );
};

export { Polygon, Polygons };

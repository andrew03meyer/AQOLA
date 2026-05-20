import { useAppStore } from "@/app/store/AppStore";
import { SchoolMarkers } from "./SchoolMarkers";
import { getSchools } from "../../lib/Api";
import { useState, useEffect } from "react";
import { School } from "../../lib/ApiModels";
import { Polygons } from "./Polygons";
import { useMapEvents } from "react-leaflet";

const MapOrchestrator = () => {
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const setZoom = useAppStore((state) => state.setZoom);
  const [schools, setSchools] = useState<School[]>([]);

  const map = useMapEvents({
    moveend: () => {
      setZoom(map.getZoom());
    },
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Fetch schools only when selectedDataset changes to "schools"
  useEffect(() => {
    if (selectedDataset === "schools") {
      const fetchSchools = async () => {
        try {
          const data = await getSchools();
          setSchools(data);
        } catch (err) {
          console.error("Failed to fetch schools:", err);
        }
      };
      fetchSchools();
    }
  }, [selectedDataset]);

  if (!selectedDataset) return null;

  if (selectedDataset === "schools") {
    return <SchoolMarkers schools={schools} />;
  }

  return <Polygons />;
};

export default MapOrchestrator;
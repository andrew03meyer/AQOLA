import { useAppStore } from "@/app/store/AppStore";
import { SchoolMarkers } from "./SchoolMarkers";
import { PropertyMarkers } from "./PropertyMarkers";
import { getSchools, getProperties } from "../../lib/Api";
import { useState, useEffect } from "react";
import { School, Property } from "../../lib/ApiModels";
import { Polygons } from "./Polygons";
import { useMapEvents } from "react-leaflet";

const MapOrchestrator = () => {
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const setZoom = useAppStore((state) => state.setZoom);
  const zoom = useAppStore((state) => state.currentZoom); // Read zoom level
  
  const [schools, setSchools] = useState<School[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState<boolean>(false); // Loader tracking flag

  const map = useMapEvents({
    moveend: () => {
      setZoom(map.getZoom());
    },
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Fetch schools
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

  // Fetch properties with defensive load state management
  useEffect(() => {
    if (selectedDataset === "properties") {
      const fetchProperties = async () => {
        try {
          setIsLoadingProps(true);
          const data = await getProperties();
          setProperties(data);
        } catch (err) {
          console.error("Failed to fetch properties:", err);
        } finally {
          setIsLoadingProps(false);
        }
      };
      fetchProperties();
    }
  }, [selectedDataset]);

  if (!selectedDataset) return null;

  // Render overlay notice if dataset is still transferring
  if (selectedDataset === "properties" && isLoadingProps) {
    return (
      <div className="absolute top-20 right-4 bg-white text-black p-3 rounded-lg shadow-lg z-[1000] font-semibold flex items-center gap-2 border border-gray-200">
        <span className="animate-spin rounded-full h-4 w-4 border-b.2 border-blue-600"></span>
        Loading Property Data Base...
      </div>
    );
  }

  // Render a helpful hint banner if the user switches to properties but is zoomed out too far
  if (selectedDataset === "properties" && zoom < 15) {
    return (
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl z-[1000] font-medium text-sm border border-blue-700 animate-pulse">
        🔍 Zoom in closer to view individual housing markers
      </div>
    );
  }

  if (selectedDataset === "schools") {
    return <SchoolMarkers schools={schools} />;
  }

  if (selectedDataset === "properties") {
    return <PropertyMarkers properties={properties} />;
  }

  return <Polygons />;
};

export default MapOrchestrator;
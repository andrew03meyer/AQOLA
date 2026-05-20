"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { School } from "../../lib/ApiModels";
import { useAppStore } from "../../store/AppStore";

// Marker icon colour red state when selected
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const violetIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Line 44 - remove the extra angle brackets from the type annotation
const schoolStageMarker: Record<string, any> = {"Primary": blueIcon, "Secondary": greenIcon, "Further Education": violetIcon, "Mixed": orangeIcon}

// Interface ensures page.tsx can send the school array
interface SchoolMarkersProps {
  schools: School[];
}

  const SchoolMarkers = ({ schools }: SchoolMarkersProps) => {

  // To use AppState
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const selectedAreas = useAppStore((state) => state.selectedAreas);
  const toggleArea = useAppStore((state) => state.toggleArea);

  if (selectedDataset !== "schools") return null;

  const recentSchools = schools.filter(
    (school) => school.year_range === "2024-2025"
  );

  const ofstedDict = { "-1": "Ungraded", "0": "Ungraded", "1": "Inadequate", "2": "Satisfactory", "3": "Good", "4": "Outstanding" };

  return (
    <>
      {recentSchools.map((school) => {
        const urnString = String(school.urn);

        //  Check if this marker is in the AppState
        const isSelected = selectedAreas.includes(urnString);

        let stage = "Primary"

        // Set colours for pointers on map
        const stageCount = [school.is_primary, school.is_secondary, school.is_post16].filter(Boolean).length

        if (stageCount > 1) {
          stage = "Mixed"
        } else if (school.is_post16) {
          stage = "Further Education"
        } else if (school.is_secondary) {
          stage = "Secondary"
        }

        return (
          <Marker
            key={school.urn}
            position={[school.latitude, school.longitude]}

            // Visual proof that the state is working
            icon={isSelected ? redIcon : schoolStageMarker[stage]}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => {
                toggleArea(urnString);
              },
            }}
          >
            <Popup className="popup">
      <div className="text-black p-1" style={{ minWidth: '220px' }}>
        <h3 className="font-bold text-lg border-b border-gray-200 mb-2 pb-1">
          {school.school_name}
        </h3>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
          <span className="text-gray-500 font-medium">URN:</span> 
          <span>{school.urn}</span>
          
          <span className="text-gray-500 font-medium">Postcode:</span> 
          <span>{school.postcode}</span>
          
          <span className="text-gray-500 font-medium">Ofsted:</span> 
            {/* {school.ofsted_ranking === 0 || school.ofsted_ranking === -1
            ? "Not judged"
            : school.ofsted_ranking ?? "N/A"} */}
            <span>
              {ofstedDict[String(school.ofsted_ranking) as keyof typeof ofstedDict] ?? "N/A"}
            </span>
          
          <span className="text-gray-500 font-medium">Gender:</span> 
          <span>{school.gender}</span>
          
          <span className="text-gray-500 font-medium">Year Range:</span> 
          <span>{school.year_range}</span>
          
          <span className="text-gray-500 font-medium">Education level:</span>
            {[
              school.is_primary && "Primary",
              school.is_secondary && "Secondary",
              school.is_post16 && "Post-16"
            ].filter(Boolean).join(", ") || "None"}

          <span className="text-gray-500 font-medium">LSOA ID:</span> 
          <span className="text self-center">{school.lsoa_id}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export { SchoolMarkers };
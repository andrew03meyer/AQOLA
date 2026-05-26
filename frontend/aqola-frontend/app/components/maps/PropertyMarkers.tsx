"use client";

import L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet"; // 1. Added useMap import
import { Property } from "../../lib/ApiModels";
import { useAppStore } from "../../store/AppStore";

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
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

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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

const violetIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const typeLabelMap: Record<string, string> = {
  "D": "Detached",
  "S": "Semi-Detached",
  "T": "Terraced",
  "F": "Flat"
};

const propertyColourMarker: Record<string, any> = {
  "D": blueIcon,
  "S": greenIcon,
  "T": orangeIcon,
  "F": violetIcon
};

interface PropertyMarkersProps {
  properties: Property[];
}

const PropertyMarkers = ({ properties }: PropertyMarkersProps) => {
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const selectedAreas = useAppStore((state) => state.selectedAreas);
  const toggleArea = useAppStore((state) => state.toggleArea);
  const zoom = useAppStore((state) => state.currentZoom);

  const map = useMap();

  if (selectedDataset !== "properties") return null;
  if (zoom < 15) return null;

  // SPATIAL FILTER: Calculate the bounding box of the active viewport
  const bounds = map.getBounds();

  // Only keep properties whose coordinates sit inside the user's visible window
  const visibleProperties = properties.filter((property) =>
    bounds.contains([property.latitude, property.longitude])
  );

  return (
    <>
      {visibleProperties.map((property) => {
        const propIdString = String(property.property_id);
        const isSelected = selectedAreas.includes(propIdString);
        const friendlyType = typeLabelMap[property.property_type] || "Unknown Type";

        return (
          <Marker
            key={property.property_id}
            position={[property.latitude, property.longitude]}
            icon={isSelected ? redIcon : propertyColourMarker[property.property_type] || blueIcon}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => {
                toggleArea(propIdString);
              },
            }}
          >
            <Popup className="popup">
              <div className="text-black p-1" style={{ minWidth: '240px' }}>
                <h3 className="font-bold text-base border-b border-gray-200 mb-2 pb-1 leading-snug">
                  {property.full_address}
                </h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <span className="text-gray-500 font-medium">Postcode:</span> 
                  <span className="font-semibold">{property.postcode}</span>
                  
                  <span className="text-gray-500 font-medium">Type:</span> 
                  <span>{friendlyType}</span>
                  
                  <span className="text-gray-500 font-medium">Size:</span> 
                  <span>{property.square_metres} m²</span>

                  <span className="text-gray-500 font-medium">LSOA ID:</span> 
                  <span className="text-xs self-center text-gray-700">{property.lsoa_id}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export { PropertyMarkers };
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
  height?: string;
}

function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export function LocationPicker({
  onLocationSelect,
  initialPosition,
  height = "300px",
}: LocationPickerProps) {
  const defaultCenter: L.LatLngExpression = initialPosition
    ? [initialPosition.lat, initialPosition.lng]
    : [21.0285, 105.8542]; // Hà Nội mặc định

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-md overflow-hidden border"
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}

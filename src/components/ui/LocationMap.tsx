"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  location: string;
}

export default function LocationMap({ location }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [MapComponents, setMapComponents] = useState<any>(null);

  // Geocode
  useEffect(() => {
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { "User-Agent": "TheFischerGroup/1.0" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data[0]) setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [location]);

  // Dynamically import Leaflet (browser-only)
  useEffect(() => {
    if (!coords) return;
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      // Fix default marker icons
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapComponents(rl);
    });
  }, [coords]);

  if (failed) return null;

  if (!coords || !MapComponents) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm gap-1.5">
        <MapPin className="h-4 w-4 animate-pulse" /> {location}
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[coords.lat, coords.lon]}
        zoom={13}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[coords.lat, coords.lon]}>
          <Popup>{location}</Popup>
        </Marker>
      </MapContainer>
    </>
  );
}

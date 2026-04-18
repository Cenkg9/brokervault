"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  location: string;
}

export default function LocationMap({ location }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    if (!location) return;

    // Geocode with Nominatim
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { "User-Agent": "TheFischerGroup/1.0" } }
    )
      .then((r) => r.json())
      .then(async (data) => {
        if (!data[0]) { setStatus("failed"); return; }
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Dynamically import Leaflet (browser-only)
        const L = (await import("leaflet")).default;

        // Add CSS once
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapRef.current || mapInstanceRef.current) return;

        // Fix marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current, {
          center: [lat, lon],
          zoom: 13,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        L.marker([lat, lon]).addTo(map).bindPopup(location);

        mapInstanceRef.current = map;
        setStatus("ready");
      })
      .catch(() => setStatus("failed"));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  if (status === "failed") return null;

  return (
    <div className="relative w-full h-full">
      {status === "loading" && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm gap-1.5 z-10">
          <MapPin className="h-4 w-4 animate-pulse" /> {location}
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

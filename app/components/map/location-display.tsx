import { useEffect, useState, useRef } from "react";

interface LocationDisplayProps {
  location: string;
  className?: string;
}

export function LocationDisplay({
  location,
  className = "",
}: LocationDisplayProps) {
  const [isValidCoordinates, setIsValidCoordinates] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = location.match(coordRegex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);

      // Validate coordinate ranges
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setIsValidCoordinates(true);
        setCoordinates([lat, lng]);
      } else {
        setIsValidCoordinates(false);
      }
    } else {
      setIsValidCoordinates(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      isValidCoordinates &&
      coordinates &&
      mapRef.current &&
      typeof window !== "undefined"
    ) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        import("leaflet/dist/leaflet.css");

        // Fix for default markers in webpack/vite environments
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Clean up previous map instance
        if (mapInstance) {
          mapInstance.remove();
        }

        // Create new map instance
        const map = L.map(mapRef.current!, {
          center: coordinates,
          zoom: 15,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add marker
        L.marker(coordinates).addTo(map).bindPopup("Ubicación del ticket");

        setMapInstance(map);

        // Force map resize after a short delay to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      });
    }

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [isValidCoordinates, coordinates]);

  if (isValidCoordinates && coordinates) {
    return (
      <div className={`relative ${className}`}>
        <div
          id={mapId.current}
          ref={mapRef}
          className="h-96 w-full rounded-lg overflow-hidden border bg-gray-100"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Coordenadas: {coordinates[0]}, {coordinates[1]}
        </p>
      </div>
    );
  }

  // Display as regular text if not valid coordinates
  return (
    <div className={className}>
      <p className="text-sm">{location}</p>
    </div>
  );
}

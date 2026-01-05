import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Service } from '@/data/services';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapComponentProps {
  services: Service[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
  onLocationSelect?: (lat: number, lon: number) => void;
  selectedLocation?: { lat: number; lon: number };
}

export function MapComponent({
  services,
  center = [19.0760, 72.8777], // Default to Mumbai
  zoom = 10,
  heightClass = 'h-64 xs:h-80 sm:h-96 md:h-[400px]'
}: MapComponentProps) {
  // Filter services with valid coordinates
  const validServices = services.filter(service => service.latitude && service.longitude);

  return (
    <div className={heightClass}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validServices.map((service) => (
          <Marker
            key={service.id}
            position={[service.latitude!, service.longitude!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{service.name}</h3>
                <p className="text-xs text-muted-foreground">{service.category}</p>
                <p className="text-xs">{service.location}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs">⭐ {service.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({service.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
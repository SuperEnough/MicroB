
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Business, LatLng } from '../types';

// Fix for default marker icons in Leaflet + React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface BusinessMapProps {
  businesses: Business[];
  center: LatLng;
  onBusinessSelect: (business: Business) => void;
  selectedBusinessId?: string;
}

const RecenterMap: React.FC<{ center: LatLng }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
};

const BusinessMap: React.FC<BusinessMapProps> = ({ businesses, center, onBusinessSelect, selectedBusinessId }) => {
  return (
    <div className="w-full h-full">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        
        {/* User Location Indicator */}
        <Circle 
          center={[center.lat, center.lng]}
          radius={1200}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
        />
        <CircleMarker 
          center={[center.lat, center.lng]}
          radius={8}
          pathOptions={{ color: 'white', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>

        {businesses.map((business) => (
          <Marker 
            key={business.id} 
            position={[business.latitude, business.longitude]}
            eventHandlers={{
              click: () => onBusinessSelect(business),
            }}
          >
            <Popup>
              <div className="font-bold">{business.name}</div>
              <div className="text-xs text-gray-500">{business.category}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusinessMap;

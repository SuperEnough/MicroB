
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Business, LatLng } from '../types';
import { CATEGORY_COLORS } from '../constants';

// Helper to create category icons
const createCategoryIcon = (category: string) => {
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280';
  
  // We use a simple HTML string for the icon to avoid complex React rendering inside Leaflet
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      ">
        ${svgIcon}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid ${color};
        margin: -4px auto 0;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
      "></div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40],
  });
};

interface BusinessMapProps {
  businesses: Business[];
  center: LatLng;
  onBusinessSelect: (business: Business) => void;
  selectedBusinessId?: string;
  showUserLocation?: boolean;
}

const RecenterMap: React.FC<{ center: LatLng }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
};

const BusinessMap: React.FC<BusinessMapProps> = ({ businesses, center, onBusinessSelect, selectedBusinessId, showUserLocation = false }) => {
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
        {showUserLocation && (
          <>
            {/* Area Circle (e.g., 'Walking Distance') */}
            <Circle 
              center={[center.lat, center.lng]}
              radius={1200}
              pathOptions={{ 
                color: '#2563eb', // Blue-600
                fillColor: '#3b82f6', // Blue-500
                fillOpacity: 0.1, 
                weight: 1,
                dashArray: '5, 5'
              }}
            />
            {/* User Pin (Current Location Dot) */}
            <CircleMarker 
              center={[center.lat, center.lng]}
              radius={8}
              pathOptions={{ 
                color: 'white', 
                fillColor: '#2563eb', // Blue-600
                fillOpacity: 1, 
                weight: 3,
                className: 'shadow-lg'
              }}
            >
              <Popup autoClose={false} closeButton={false} className="font-bold text-xs">
                You
              </Popup>
            </CircleMarker>
          </>
        )}

        {businesses.map((business) => (
          <Marker 
            key={business.id} 
            position={[business.latitude, business.longitude]}
            icon={createCategoryIcon(business.category)}
            eventHandlers={{
              click: () => onBusinessSelect(business),
            }}
          >
            <Popup>
              <div className="font-bold text-sm mb-1">{business.name}</div>
              <div 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block text-white"
                style={{ backgroundColor: CATEGORY_COLORS[business.category] || '#6b7280' }}
              >
                {business.category}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusinessMap;

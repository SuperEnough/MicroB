
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Business, LatLng } from '../types';
import { CATEGORY_COLORS } from '../constants';

// Helper to create category icons
export const createCategoryIcon = (category: string) => {
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280';
  
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
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        margin-top: -18px;
        margin-left: -18px;
      ">
        <div style="transform: rotate(45deg); display: flex;">
          ${svgIcon}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Point of the pin
    popupAnchor: [0, -36],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-pulse',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
        <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

const BusinessMap: React.FC<BusinessMapProps> = ({ businesses, center, onBusinessSelect, selectedBusinessId, showUserLocation = false }) => {
  return (
    <div className="w-full h-full">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false} // Custom zoom control or relying on scroll
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <RecenterMap center={center} />
        
        {/* User Location Indicator */}
        {showUserLocation && (
          <>
            <Circle 
              center={[center.lat, center.lng]}
              radius={800} // ~10 min walk
              pathOptions={{ 
                color: '#3b82f6', 
                fillColor: '#3b82f6', 
                fillOpacity: 0.05, 
                weight: 1, 
                dashArray: '5, 10',
                opacity: 0.5
              }}
            />
            <Marker 
              position={[center.lat, center.lng]}
              icon={createUserLocationIcon()}
              zIndexOffset={1000} // Keep on top
            >
              <Popup autoClose={false} closeButton={false} className="font-bold text-xs">
                You are here
              </Popup>
            </Marker>
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
              <div className="text-center">
                <div className="font-bold text-sm mb-1">{business.name}</div>
                <div 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[business.category] || '#6b7280' }}
                >
                  {business.category}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusinessMap;

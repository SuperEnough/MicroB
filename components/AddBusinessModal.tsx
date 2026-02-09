
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Wand2, Loader2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';
import { Category, Business, LatLng } from '../types';
import { generateBusinessBio } from '../services/geminiService';
import { createCategoryIcon } from './BusinessMap';

interface AddBusinessModalProps {
  onClose: () => void;
  onSubmit: (business: Omit<Business, 'id' | 'status' | 'createdAt'>) => Promise<void> | void;
  currentLocation: LatLng;
}

// Component to handle map clicks/drags for the pin
const LocationSelector: React.FC<{ 
  position: LatLng; 
  onPositionChange: (lat: number, lng: number) => void;
  category: string;
}> = ({ position, onPositionChange, category }) => {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  // Allow clicking anywhere to move pin
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  // Fly to location when it changes significantly (optional, good for UX if location updates externally)
  // But usually we just let the user pan.
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange(lat, lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={createCategoryIcon(category)}
      zIndexOffset={100}
    />
  );
};

// Component to recenter map initially or when location changes externally
const MapRecenter: React.FC<{ center: LatLng }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 16);
  }, [center, map]);
  return null;
};

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ onClose, onSubmit, currentLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    whatsapp: '',
    phone: '',
    description: '',
    keywords: '', // for AI generation
  });
  
  const [pinLocation, setPinLocation] = useState<LatLng>(currentLocation);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiBio = async () => {
    if (!formData.name || !formData.keywords) {
      alert("Please enter business name and some keywords first!");
      return;
    }
    setIsGenerating(true);
    const bio = await generateBusinessBio(formData.name, formData.category, formData.keywords);
    if (bio) {
      setFormData(prev => ({ ...prev, description: bio }));
    }
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        category: formData.category as Category,
        whatsapp: formData.whatsapp,
        phone: formData.phone || formData.whatsapp,
        description: formData.description,
        image: `https://picsum.photos/seed/${formData.name}/600/400`,
        latitude: pinLocation.lat,
        longitude: pinLocation.lng,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center p-6 border-b shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add My Business</h2>
            <p className="text-sm text-gray-500">Drag pin or click map to set precise location</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Interactive Map Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                    Business Location <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                    {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
                </span>
              </div>
              
              <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-100 relative shadow-inner group">
                <MapContainer 
                  center={[currentLocation.lat, currentLocation.lng]} 
                  zoom={16} 
                  className="h-full w-full"
                  scrollWheelZoom={false} // Disable scroll zoom to prevent page scroll issues unless focused? Let's keep false for modal.
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapRecenter center={currentLocation} />
                  <LocationSelector 
                    position={pinLocation} 
                    onPositionChange={(lat, lng) => setPinLocation({ lat, lng })} 
                    category={formData.category}
                  />
                </MapContainer>
                
                {/* Overlay Hint */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-[400] pointer-events-none flex items-center gap-1">
                    <MapPin size={12} className="text-black" />
                    Tap map to place pin
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name *</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="e.g. The Coffee Corner"
                  value={formData.name}
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  value={formData.category}
                  onChange={e => setFormData(p => ({...p, category: e.target.value as Category}))}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp *</label>
                <input 
                  required
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="1234567890"
                  value={formData.whatsapp}
                  onChange={e => setFormData(p => ({...p, whatsapp: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                <input 
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Keywords for AI Bio</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"
                  placeholder="e.g. artisan, fresh, downtown"
                  value={formData.keywords}
                  onChange={e => setFormData(p => ({...p, keywords: e.target.value}))}
                />
                <button 
                  type="button"
                  onClick={handleAiBio}
                  disabled={isGenerating}
                  className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  Bio
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea 
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="Tell us about your business..."
                value={formData.description}
                onChange={e => setFormData(p => ({...p, description: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 sticky bottom-0 z-10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Business Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusinessModal;

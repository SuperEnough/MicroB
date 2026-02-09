
import React, { useState, useMemo, useRef } from 'react';
import { X, Wand2, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES } from '../constants';
import { Category, Business, LatLng } from '../types';
import { generateBusinessBio } from '../services/geminiService';

interface AddBusinessModalProps {
  onClose: () => void;
  onSubmit: (business: Omit<Business, 'id' | 'status' | 'createdAt'>) => Promise<void> | void;
  currentLocation: LatLng;
}

// Component to handle map clicks/drags for the pin
const LocationSelector: React.FC<{ 
  position: LatLng; 
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  const markerRef = useRef<L.Marker>(null);

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
    />
  );
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
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add My Business</h2>
            <p className="text-sm text-gray-500">Step 2: Business Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Interactive Map Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Location <span className="text-red-500">*</span>
              </label>
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner">
                <MapContainer 
                  center={[currentLocation.lat, currentLocation.lng]} 
                  zoom={15} 
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSelector 
                    position={pinLocation} 
                    onPositionChange={(lat, lng) => setPinLocation({ lat, lng })} 
                  />
                </MapContainer>
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur text-xs p-2 rounded-lg z-[400] text-center shadow-sm">
                  Drag the marker to your exact storefront location
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
          
          <div className="p-6 border-t bg-gray-50">
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

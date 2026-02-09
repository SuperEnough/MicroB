
import React, { useState } from 'react';
import { X, MapPin, Upload, Wand2, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category, Business, LatLng } from '../types';
import { generateBusinessBio } from '../services/geminiService';

interface AddBusinessModalProps {
  onClose: () => void;
  onSubmit: (business: Omit<Business, 'id' | 'status' | 'createdAt'>) => Promise<void> | void;
  currentLocation: LatLng;
}

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ onClose, onSubmit, currentLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    whatsapp: '',
    phone: '',
    description: '',
    keywords: '', // for AI generation
  });
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
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add My Business</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-4">
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
                  Magic Bio
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

            <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl">
              <MapPin size={20} />
              <div className="text-xs">
                <p className="font-bold">Your Pin Location</p>
                <p>We'll use your current GPS location to place the marker.</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'List My Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusinessModal;

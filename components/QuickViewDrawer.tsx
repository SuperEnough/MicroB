
import React from 'react';
import { Business } from '../types';
import { X, Phone, MessageCircle, MapPin, Tag } from 'lucide-react';

interface QuickViewDrawerProps {
  business: Business | null;
  onClose: () => void;
}

const QuickViewDrawer: React.FC<QuickViewDrawerProps> = ({ business, onClose }) => {
  if (!business) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none md:flex md:justify-end">
      {/* Overlay Backdrop Mobile */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto md:hidden" 
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className={`
        absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 pointer-events-auto
        md:relative md:top-0 md:h-full md:w-96 md:rounded-none md:rounded-l-3xl
        ${business ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
      `}>
        {/* Handle for Mobile Swipe (Visual only) */}
        <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto my-3 md:hidden" />
        
        {/* Close Button Desktop */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 overflow-y-auto max-h-[80vh] md:max-h-full">
          <img 
            src={business.image} 
            alt={business.name} 
            className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md"
          />
          
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
              <Tag size={12} />
              {business.category}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{business.name}</h2>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {business.description}
          </p>

          <div className="flex items-center gap-2 text-gray-500 mb-8">
            <MapPin size={16} />
            <span className="text-sm">Located near you</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <a 
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200"
            >
              <MessageCircle size={24} />
              WhatsApp Now
            </a>
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all"
            >
              <Phone size={24} />
              Call Business
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewDrawer;

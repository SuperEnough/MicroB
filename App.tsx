
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Map as MapIcon, Filter, Locate, Loader2 } from 'lucide-react';
import { Business, Category, LatLng } from './types';
import { CATEGORIES, INITIAL_BUSINESSES } from './constants';
import BusinessMap from './components/BusinessMap';
import QuickViewDrawer from './components/QuickViewDrawer';
import AddBusinessModal from './components/AddBusinessModal';

const App: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng>({ lat: 40.7128, lng: -74.0060 }); // Default NYC
  const [isLocating, setIsLocating] = useState(false);

  // Request user location on mount
  useEffect(() => {
    handleLocateUser();
  }, []);

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setIsLocating(false);
        }
      );
    }
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [businesses, selectedCategory, searchQuery]);

  const handleAddBusiness = (newBusinessData: Omit<Business, 'id' | 'status' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...newBusinessData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Active',
      createdAt: Date.now()
    };
    setBusinesses(prev => [newBusiness, ...prev]);
    setShowAddModal(false);
    setSelectedBusiness(newBusiness);
  };

  return (
    <div className="relative h-screen w-full bg-white overflow-hidden flex flex-col font-sans">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[50] p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Top Bar */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Find local services..." 
                className="w-full h-14 pl-12 pr-4 bg-white/95 backdrop-blur-md border-none shadow-xl rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-14 w-14 flex items-center justify-center bg-black text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 pointer-events-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-md ${selectedCategory === 'All' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-md ${selectedCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Locate Me Button Overlay */}
      <div className="absolute bottom-24 right-4 z-[50] flex flex-col gap-2">
        <button 
          onClick={handleLocateUser}
          className="h-12 w-12 flex items-center justify-center bg-white text-black rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"
        >
          {isLocating ? <Loader2 className="animate-spin" size={20} /> : <Locate size={20} />}
        </button>
      </div>

      {/* Main Map Content */}
      <main className="flex-1 relative z-[1]">
        <BusinessMap 
          businesses={filteredBusinesses} 
          center={userLocation}
          onBusinessSelect={setSelectedBusiness}
          selectedBusinessId={selectedBusiness?.id}
        />
      </main>

      {/* Business Details Drawer */}
      <QuickViewDrawer 
        business={selectedBusiness} 
        onClose={() => setSelectedBusiness(null)} 
      />

      {/* Add Business Modal */}
      {showAddModal && (
        <AddBusinessModal 
          currentLocation={userLocation}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddBusiness}
        />
      )}

      {/* Mobile Nav Bar - Visual Only */}
      <nav className="md:hidden bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-[50]">
        <button className="flex flex-col items-center gap-1 text-black">
          <MapIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Filter size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Search size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Search</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

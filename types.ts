
export type Category = 'Hair & Beauty' | 'Home Services' | 'Food & Drink' | 'Retail' | 'Wellness' | 'Creative' | 'Other';

export interface Business {
  id: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  whatsapp: string;
  phone: string;
  description: string;
  image: string;
  status: 'Active' | 'Inactive';
  createdAt: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

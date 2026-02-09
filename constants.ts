
import { Category, Business } from './types';

export const CATEGORIES: Category[] = [
  'Hair & Beauty',
  'Home Services',
  'Food & Drink',
  'Retail',
  'Wellness',
  'Creative',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Hair & Beauty': '#ec4899', // Pink
  'Home Services': '#f59e0b', // Amber
  'Food & Drink': '#ef4444', // Red
  'Retail': '#3b82f6', // Blue
  'Wellness': '#10b981', // Emerald
  'Creative': '#8b5cf6', // Violet
  'Other': '#6b7280', // Gray
};

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: '1',
    name: "Aria's Artisan Bakery",
    category: 'Food & Drink',
    latitude: 40.7128,
    longitude: -74.0060,
    whatsapp: '1234567890',
    phone: '1234567890',
    description: "Handcrafted sourdough and pastries made with local organic grains. Fresh out of the oven every morning!",
    image: 'https://picsum.photos/seed/bakery/600/400',
    status: 'Active',
    createdAt: Date.now()
  },
  {
    id: '2',
    name: "Green Thumb Gardening",
    category: 'Home Services',
    latitude: 40.7300,
    longitude: -73.9950,
    whatsapp: '9876543210',
    phone: '9876543210',
    description: "Sustainable garden design and maintenance. We specialize in native plants and urban vegetable patches.",
    image: 'https://picsum.photos/seed/garden/600/400',
    status: 'Active',
    createdAt: Date.now()
  },
  {
    id: '3',
    name: "Precision Cuts Barber",
    category: 'Hair & Beauty',
    latitude: 40.7200,
    longitude: -74.0100,
    whatsapp: '5551234567',
    phone: '5551234567',
    description: "Master barber with 15 years experience. Traditional hot towel shaves and modern fades.",
    image: 'https://picsum.photos/seed/barber/600/400',
    status: 'Active',
    createdAt: Date.now()
  }
];

import { Category } from './types';

export const categories: Category[] = [
  {
    id: 'pizza',
    name: 'Pizza',
    nameEn: 'Pizza',
    description: 'Authentische italienische Pizza',
    descriptionEn: 'Authentic Italian pizza',
    order: 1,
  },
  {
    id: 'burger',
    name: 'Burger',
    nameEn: 'Burger',
    description: 'Saftige Burger mit frischen Zutaten',
    descriptionEn: 'Juicy burgers with fresh ingredients',
    order: 2,
  },
  {
    id: 'doener',
    name: 'Döner',
    nameEn: 'Döner',
    description: 'Klassischer türkischer Döner',
    descriptionEn: 'Classic Turkish döner',
    order: 3,
  },
  {
    id: 'pasta',
    name: 'Pasta',
    nameEn: 'Pasta',
    description: 'Hausgemachte Pasta-Genüsse',
    descriptionEn: 'Homemade pasta delights',
    order: 4,
  },
  {
    id: 'salads',
    name: 'Salate',
    nameEn: 'Salads',
    description: 'Frische und gesunde Salate',
    descriptionEn: 'Fresh and healthy salads',
    order: 5,
  },
  {
    id: 'drinks',
    name: 'Getränke',
    nameEn: 'Drinks',
    description: 'Erfrischende Getränke',
    descriptionEn: 'Refreshing drinks',
    order: 6,
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategories = (): Category[] => {
  return categories.sort((a, b) => a.order - b.order);
};

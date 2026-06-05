export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon?: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  basePrice: number;
  discountPrice?: number;
  allergens: Allergen[];
  ingredients: string[];
  available: boolean;
  featured: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  preparationTime?: number; // in minutes
  calories?: number;
}

export type Allergen =
  | 'Gluten'
  | 'Crustaceans'
  | 'Eggs'
  | 'Fish'
  | 'Peanuts'
  | 'Soybeans'
  | 'Milk'
  | 'Nuts'
  | 'Celery'
  | 'Mustard'
  | 'Sesame'
  | 'Sulphites'
  | 'Lupin'
  | 'Molluscs';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  comments?: string;
}

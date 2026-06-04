// Image utility for placeholder management
// This can be easily swapped for Cloudinary integration later

export type ImageCategory = 'restaurant' | 'pizza' | 'burger' | 'doener' | 'pasta' | 'salad' | 'drink';

export interface ImageConfig {
  width: number;
  height: number;
  category?: ImageCategory;
  alt?: string;
}

// Placeholder image generator
// In production, this would be replaced with Cloudinary URLs
export function getPlaceholderImage(config: ImageConfig): string {
  const { width, height, category = 'restaurant', alt = 'Placeholder' } = config;
  
  // Using a simple colored placeholder with text
  // This can be replaced with Cloudinary in production
  const colors: Record<ImageCategory, string> = {
    restaurant: '#4a5568',
    pizza: '#ed8936',
    burger: '#f6ad55',
    doener: '#dd6b20',
    pasta: '#c05621',
    salad: '#48bb78',
    drink: '#4299e1',
  };

  const color = colors[category];
  const text = encodeURIComponent(alt || category);
  
  // Using a simple placeholder service
  // In production, replace with: `https://res.cloudinary.com/your-cloud/image/upload/${config}`
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='${color}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='white'%3E${text}%3C/text%3E%3C/svg%3E`;
}

// Cloudinary-ready function (for future integration)
export function getCloudinaryUrl(publicId: string, transformations?: Record<string, string>): string {
  // Placeholder implementation - replace with actual Cloudinary SDK when ready
  // Example: return cloudinary.url(publicId, { transformation: transformations });
  return getPlaceholderImage({ width: 400, height: 400, category: 'restaurant' });
}

// Helper to get menu item image
export function getMenuItemImage(categoryId: string, itemName: string): string {
  const categoryMap: Record<string, ImageCategory> = {
    pizza: 'pizza',
    burger: 'burger',
    doener: 'doener',
    pasta: 'pasta',
    salads: 'salad',
    drinks: 'drink',
  };

  const category = categoryMap[categoryId] || 'restaurant';
  return getPlaceholderImage({
    width: 400,
    height: 400,
    category,
    alt: itemName,
  });
}

// Helper to get restaurant header image
export function getRestaurantImage(restaurantName: string): string {
  return getPlaceholderImage({
    width: 1200,
    height: 400,
    category: 'restaurant',
    alt: restaurantName,
  });
}

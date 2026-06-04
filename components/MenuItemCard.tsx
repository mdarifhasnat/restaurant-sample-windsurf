'use client';

import { MenuItem } from '@/src/data/types';

interface MenuItemCardProps {
  item: MenuItem;
  onItemClick?: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onItemClick }: MenuItemCardProps) {
  const price = item.discountPrice || item.basePrice;
  const hasDiscount = item.discountPrice && item.discountPrice < item.basePrice;

  return (
    <div 
      className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onItemClick?.(item)}
    >
      <div className="flex gap-4">
        {item.image && (
          <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            {!item.available && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-md flex-shrink-0">
                Nicht verfügbar
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span
                className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 cursor-help relative group"
              >
                {item.allergens.length} Allergene
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
                  {item.allergens.join(', ')}
                </div>
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {item.basePrice.toFixed(2)}€
                </span>
              )}
              <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                {price.toFixed(2)}€
              </span>
            </div>
            
            <button
              disabled={!item.available}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`View ${item.name} details`}
            >
              <span className="hidden sm:inline">Hinzufügen</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import MenuItemCard from './MenuItemCard';
import { MenuItem } from '@/src/data/types';

interface MenuSectionProps {
  id: string;
  title: string;  
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}

export default function MenuSection({ id, title, items, onItemClick }: MenuSectionProps) {
  return (
    <div id={`section-${id}`} className="mb-8 scroll-mt-40">
      <div className="space-y-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}

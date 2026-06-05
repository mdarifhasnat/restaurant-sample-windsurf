'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import RestaurantHeader from '@/components/RestaurantHeader';
import RestaurantInfo from '@/components/RestaurantInfo';
import MenuSearch from '@/components/MenuSearch';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import BasketSidebar from '@/components/BasketSidebar';
import ItemDetailModal from '@/components/ItemDetailModal';
import Footer from '@/components/Footer';
import { getRestaurantImage } from '@/lib/images';
import { categories } from '@/src/data/categories';
import { getMenuItemsByCategory } from '@/src/data/menu-items';
import { MenuItem } from '@/src/data/types';
import { MenuItemDetail, SelectedOptions } from '@/types/menu-modal';
import { useCart } from '@/hooks/useCart';

// Helper function to check if restaurant is open
function isRestaurantOpen(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Restaurant hours: 11:00 - 22:00
  const openTime = 11 * 60; // 11:00
  const closeTime = 22 * 60; // 22:00
  
  return currentTime >= openTime && currentTime < closeTime;
}

export default function RestaurantPage() {
  const { items: cart, addItem, removeItem, increaseQuantity, decreaseQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Record<string, MenuItem[]>>({});
  const [isOpen, setIsOpen] = useState(isRestaurantOpen());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Update open status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(isRestaurantOpen());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll-based active category
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry with the highest intersection ratio
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Sort by intersection ratio (highest first)
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        const mostVisible = visibleEntries[0];
        const categoryId = mostVisible.target.id.replace('section-', '');
        setActiveCategory(categoryId);
      }
    }, observerOptions);

    // Observe all menu sections
    const observeSections = () => {
      const sections = document.querySelectorAll('[id^="section-"]');
      sections.forEach(section => observer.observe(section));
      return sections;
    };

    const sections = observeSections();

    // Re-observe when DOM changes (for dynamic content)
    const mutationObserver = new MutationObserver(() => {
      observer.disconnect();
      observeSections();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [filteredItems]);

  // Initialize menu items
  useEffect(() => {
    const items: Record<string, MenuItem[]> = {};
    categories.forEach(cat => {
      items[cat.id] = getMenuItemsByCategory(cat.id);
    });
    setFilteredItems(items);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      const items: Record<string, MenuItem[]> = {};
      categories.forEach(cat => {
        items[cat.id] = getMenuItemsByCategory(cat.id);
      });
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered: Record<string, MenuItem[]> = {};
      
      categories.forEach(cat => {
        const categoryItems = getMenuItemsByCategory(cat.id).filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.nameEn.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.descriptionEn.toLowerCase().includes(query) ||
          item.ingredients.some(ing => ing.toLowerCase().includes(query))
        );
        if (categoryItems.length > 0) {
          filtered[cat.id] = categoryItems;
        }
      });
      
      setFilteredItems(filtered);
    }
  }, [searchQuery]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      nameEn: item.nameEn,
      price: item.discountPrice || item.basePrice,
      specialInstructions: '',
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId);
      return;
    }
    const item = cart.find(i => i.id === itemId);
    if (item) {
      const diff = quantity - item.quantity;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          increaseQuantity(itemId);
        }
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          decreaseQuantity(itemId);
        }
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleCheckout = (orderType: 'delivery' | 'pickup', address?: string) => {
    // Store order type and address in localStorage for checkout page
    localStorage.setItem('orderType', orderType);
    if (address) {
      localStorage.setItem('deliveryAddress', address);
    }
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Convert MenuItem to MenuItemDetail format
  const convertToMenuItemDetail = (item: MenuItem): MenuItemDetail => {
    return {
      id: item.id,
      name: item.name,
      basePrice: item.basePrice,
      description: item.description,
      image: item.image,
      allergenInfo: item.allergens.length > 0 ? `Contains: ${item.allergens.join(', ')}` : undefined,
      optionGroups: [
        // SIZE (Small/Medium/Large) - Required
        {
          id: 'size',
          type: 'radio',
          title: 'Size:',
          helperText: 'Choose your preferred size',
          required: true,
          options: [
            { id: 'small', label: 'Small', priceAdd: -1.00 },
            { id: 'medium', label: 'Medium', priceAdd: 0 },
            { id: 'large', label: 'Large', priceAdd: 1.50 }
          ]
        },
        // OPTIONS (Standard/Vegan etc.) - Required
        {
          id: 'options',
          type: 'radio',
          title: 'Options:',
          helperText: 'Choose your preferred option',
          required: true,
          options: [
            { id: 'standard', label: 'Standard', priceAdd: 0 },
            { id: 'vegetarian', label: 'Vegetarian', priceAdd: 0 },
            { id: 'vegan', label: 'Vegan', priceAdd: 0 },
            { id: 'with-egg', label: 'With egg', priceAdd: 0.50 }
          ]
        },
        // SCHARF / Spice Level - Required
        {
          id: 'spice',
          type: 'spice',
          title: 'Scharf (Spice Level):',
          helperText: 'How spicy do you want it?',
          required: true,
          options: [
            { id: 'mild', label: 'Not spicy (mild)', priceAdd: 0, spiceLevel: 0 },
            { id: 'leicht', label: 'Slightly spicy (leicht scharf)', priceAdd: 0, spiceLevel: 1 },
            { id: 'mittel', label: 'Medium spicy (mittel scharf)', priceAdd: 0, spiceLevel: 2 },
            { id: 'sehr', label: 'Very spicy (sehr scharf)', priceAdd: 0, spiceLevel: 3 }
          ]
        },
        // MEAT TYPE (Chicken/Beef etc.) - Required
        {
          id: 'meat',
          type: 'radio',
          title: 'Meat Type:',
          helperText: 'Choose your preferred meat',
          required: true,
          options: [
            { id: 'chicken', label: 'Chicken', priceAdd: 0 },
            { id: 'beef', label: 'Beef', priceAdd: 1.00 },
            { id: 'mixed', label: 'Mixed meat', priceAdd: 0.50 }
          ]
        },
        // WITHOUT (remove ingredients) - Optional
        {
          id: 'without',
          type: 'without',
          title: 'Without:',
          helperText: 'Remove ingredients you don\'t want',
          required: false,
          options: [
            { id: 'no-onions', label: 'Without onions', priceAdd: 0 },
            { id: 'no-tomatoes', label: 'Without tomatoes', priceAdd: 0 },
            { id: 'no-lettuce', label: 'Without lettuce/salad', priceAdd: 0 },
            { id: 'no-sauce', label: 'Without sauce', priceAdd: 0 },
            { id: 'no-cheese', label: 'Without cheese', priceAdd: 0 },
            { id: 'no-jalapenos', label: 'Without jalapeños', priceAdd: 0 }
          ]
        },
        // EXTRA (add ingredients) - Optional
        {
          id: 'extra',
          type: 'checkbox',
          title: 'Extra:',
          helperText: 'Add something extra',
          required: false,
          options: [
            { id: 'extra-cheese', label: 'Extra cheese', priceAdd: 1.00 },
            { id: 'extra-sauce', label: 'Extra sauce', priceAdd: 0.50 },
            { id: 'extra-salad', label: 'Extra salad', priceAdd: 0 },
            { id: 'extra-onions', label: 'Extra onions', priceAdd: 0 },
            { id: 'extra-jalapenos', label: 'Extra jalapeños', priceAdd: 0.50 },
            { id: 'double-meat', label: 'Double meat', priceAdd: 2.50 },
            { id: 'extra-bacon', label: 'Extra bacon', priceAdd: 1.50 }
          ]
        },
        // SAUCE CHOICE - Optional
        {
          id: 'sauce',
          type: 'radio',
          title: 'Sauce Choice:',
          helperText: 'Choose your preferred sauce',
          required: false,
          options: [
            { id: 'garlic', label: 'Garlic Sauce', priceAdd: 0 },
            { id: 'bbq', label: 'BBQ Sauce', priceAdd: 0 },
            { id: 'spicy', label: 'Spicy Sauce', priceAdd: 0 },
            { id: 'none', label: 'No Sauce', priceAdd: 0 }
          ]
        }
      ]
    };
  };

  const handleModalAddToCart = (itemDetail: MenuItemDetail, quantity: number, selectedOptions: SelectedOptions, comments: string) => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        menuItemId: itemDetail.id,
        name: itemDetail.name,
        nameEn: itemDetail.name, // Using German name for both for now
        price: itemDetail.basePrice,
        specialInstructions: JSON.stringify(selectedOptions), // Store options as JSON for now
        comments: comments,
      });
    }
    handleModalClose();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" />
      
      <main className="flex-1">
        <RestaurantHeader
          name="Gasthaus Zur Gemütlichkeit"
          image={getRestaurantImage('Gasthaus Zur Gemütlichkeit')}
          rating={4.7}
          deliveryTime="30-45 Min"
          deliveryFee="2.90€"
          cuisine="Deutsche Küche"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <RestaurantInfo
                address="Dohrerstr. 4, 41238 Mönchengladbach"
                phone="+49 30 12345678"
                hours="Mo-So: 11:00 - 22:00"
                isOpen={isOpen}
              />

              <MenuSearch onSearch={setSearchQuery} placeholder="Gerichte suchen..." />

              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              <div className="space-y-8">
                {Object.entries(filteredItems).map(([categoryId, items]) => (
                  <MenuSection
                    key={categoryId}
                    id={categoryId}
                    title={categories.find(c => c.id === categoryId)?.name || ''}
                    items={items}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <BasketSidebar
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                deliveryFee={2.90}
                minimumOrder={15.00}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          item={convertToMenuItemDetail(selectedItem)}
          onAddToCart={handleModalAddToCart}
        />
      )}
    </div>
  );
}

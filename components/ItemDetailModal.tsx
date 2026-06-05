'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ItemDetailModalProps, SelectedOptions } from '@/types/menu-modal';

export default function ItemDetailModal({ isOpen, onClose, item, onAddToCart }: ItemDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [showAllergenInfo, setShowAllergenInfo] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setQuantity(1);
      setSelectedOptions({});
      setShowAllergenInfo(false);
      setComments('');
    }
  }, [isOpen]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = item.basePrice;

    // Add price from selected options
    Object.values(selectedOptions).forEach(optionIds => {
      optionIds.forEach(optionId => {
        item.optionGroups.forEach(group => {
          const option = group.options.find(opt => opt.id === optionId);
          if (option) {
            price += option.priceAdd;
          }
        });
      });
    });

    return price * quantity;
  }, [item, selectedOptions, quantity]);

  // Check if all required sections are filled
  const isFormValid = useMemo(() => {
    return item.optionGroups.every(group => {
      if (!group.required) return true;
      const selected = selectedOptions[group.id] || [];
      return selected.length > 0;
    });
  }, [item, selectedOptions]);

  const handleOptionSelect = (groupId: string, optionId: string, type: 'radio' | 'checkbox' | 'without' | 'spice') => {
    setSelectedOptions(prev => {
      if (type === 'radio' || type === 'spice') {
        return {
          ...prev,
          [groupId]: [optionId]
        };
      } else {
        const current = prev[groupId] || [];
        if (current.includes(optionId)) {
          return {
            ...prev,
            [groupId]: current.filter(id => id !== optionId)
          };
        } else {
          const group = item.optionGroups.find(g => g.id === groupId);
          if (group && group.maxSelect && current.length >= group.maxSelect) {
            return prev; // Don't add if max reached
          }
          return {
            ...prev,
            [groupId]: [...current, optionId]
          };
        }
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (isFormValid) {
      onAddToCart(item, quantity, selectedOptions, comments);
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-[520px] sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col max-h-[100vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Image */}
        <div className="relative h-[220px] flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Item Info Section */}
          <div className="px-6 py-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <span className="text-xl font-semibold text-gray-900 ml-4">
                {(item.basePrice).toFixed(2)} €
              </span>
            </div>
            <p className="text-gray-600 mb-4">{item.description}</p>
            {item.allergenInfo && (
              <button
                onClick={() => setShowAllergenInfo(!showAllergenInfo)}
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Item Info
              </button>
            )}
            {showAllergenInfo && item.allergenInfo && (
              <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
                {item.allergenInfo}
              </div>
            )}
          </div>

          {/* Customization Sections */}
          {item.optionGroups.map(group => {
            const isSelected = (optionId: string) => (selectedOptions[group.id] || []).includes(optionId);
            const isSpiceGroup = group.type === 'spice';
            const isWithoutGroup = group.type === 'without';
            const isExtraGroup = group.type === 'checkbox' && group.title.toLowerCase().includes('extra');

            return (
              <div key={group.id} className="border-t border-gray-100">
                {/* Section Header */}
                <div className="px-6 py-4 bg-stone-50">
                  {group.helperText && (
                    <p className="text-xs text-gray-500 mb-1">{group.helperText}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{group.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      group.required
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {group.required ? '1 Required' : 'Optional'}
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="px-6 py-4 space-y-3">
                  {group.options.map(option => {
                    const selected = isSelected(option.id);
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(group.id, option.id, group.type)}
                        className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all text-left ${
                          selected
                            ? isSpiceGroup
                              ? 'border-red-300 bg-red-50'
                              : isWithoutGroup
                                ? 'border-red-200 bg-red-50'
                                : isExtraGroup
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center flex-1">
                          {/* Radio/Checkbox Indicator */}
                          <div className={`w-5 h-5 mr-3 flex items-center justify-center ${
                            group.type === 'radio' || group.type === 'spice' ? 'rounded-full' : 'rounded'
                          } border-2 ${
                            selected
                              ? 'border-gray-900 bg-gray-900'
                              : 'border-gray-300'
                          }`}>
                            {selected && (
                              <div className={`w-2.5 h-2.5 bg-white ${
                                group.type === 'radio' || group.type === 'spice' ? 'rounded-full' : 'rounded-sm'
                              }`} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            {/* Without section: strikethrough when selected */}
                            {isWithoutGroup && selected ? (
                              <span className="font-medium text-gray-500 line-through">{option.label}</span>
                            ) : (
                              <span className="font-medium text-gray-900">{option.label}</span>
                            )}
                            
                            {/* Spice level: show chili icons */}
                            {isSpiceGroup && option.spiceLevel && (
                              <span className="ml-2">
                                {'🌶️'.repeat(option.spiceLevel)}
                              </span>
                            )}
                            
                            {option.infoText && (
                              <button className="ml-2 text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Without section: show warning icon when selected */}
                          {isWithoutGroup && selected && (
                            <span className="ml-2 text-red-500">
                              🚫
                            </span>
                          )}
                        </div>
                        
                        {/* Price display */}
                        {option.priceAdd > 0 && (
                          <span className="text-sm font-medium text-gray-700 ml-4">
                            +{option.priceAdd.toFixed(2)} €
                          </span>
                        )}
                        
                        {/* Without section: show "free" */}
                        {isWithoutGroup && option.priceAdd === 0 && selected && (
                          <span className="text-sm text-gray-400 ml-4">
                            free
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 px-6 py-4">
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Add comments (optional)
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Special requests, allergies, etc."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Bottom Sticky Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M20 12H4" />
              </svg>
            </button>
            <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isFormValid}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
              isFormValid
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span>Add</span>
            <span>{totalPrice.toFixed(2)} €</span>
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ItemDetailModalProps, SelectedOptions, OptionGroup, OptionValue } from '@/types/menu-modal';

export default function ItemDetailModal({ isOpen, onClose, item, onAddToCart }: ItemDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [showAllergenInfo, setShowAllergenInfo] = useState(false);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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
      // Load option groups from API
      loadOptionGroups();
    }
  }, [isOpen, item.id]);

  const loadOptionGroups = async () => {
    setLoadingOptions(true);
    try {
      const response = await fetch(`/api/backend/products/option-groups?productId=${item.id}`);
      const data = await response.json();
      if (data.success) {
        setOptionGroups(data.optionGroups);
        // Initialize default selections
        const defaults: SelectedOptions = {};
        data.optionGroups.forEach((group: OptionGroup) => {
          const defaultValue = group.values.find(v => v.isDefault);
          if (defaultValue && group.isRequired) {
            defaults[group.id] = [defaultValue.id];
          }
        });
        setSelectedOptions(defaults);
      }
    } catch (error) {
      console.error('Error loading option groups:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = item.basePrice;

    // Add price from selected options
    Object.values(selectedOptions).forEach(optionIds => {
      optionIds.forEach(optionId => {
        optionGroups.forEach(group => {
          const value = group.values.find(v => v.id === optionId);
          if (value) {
            price += value.extraPrice;
          }
        });
      });
    });

    return price * quantity;
  }, [item, selectedOptions, quantity, optionGroups]);

  // Check if all required sections are filled
  const isFormValid = useMemo(() => {
    return optionGroups.every(group => {
      if (!group.isRequired) return true;
      const selected = selectedOptions[group.id] || [];
      return selected.length >= group.minSelection && selected.length <= group.maxSelection;
    });
  }, [optionGroups, selectedOptions]);

  const handleOptionSelect = (groupId: string, valueId: string) => {
    setSelectedOptions(prev => {
      const group = optionGroups.find(g => g.id === groupId);
      if (!group) return prev;

      const current = prev[groupId] || [];

      // If maxSelection is 1, treat as radio (single selection)
      if (group.maxSelection === 1) {
        if (current.includes(valueId)) {
          // Deselect if already selected (only if not required)
          if (!group.isRequired) {
            return { ...prev, [groupId]: [] };
          }
          return prev;
        }
        return { ...prev, [groupId]: [valueId] };
      }

      // Multi-selection (checkbox)
      if (current.includes(valueId)) {
        const newSelection = current.filter(id => id !== valueId);
        return { ...prev, [groupId]: newSelection };
      } else {
        if (current.length >= group.maxSelection) {
          return prev; // Don't add if max reached
        }
        return { ...prev, [groupId]: [...current, valueId] };
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (isFormValid) {
      onAddToCart(item, quantity, selectedOptions, '');
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          <div className="relative h-[220px]">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="pb-32">
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
            {loadingOptions ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Optionen werden geladen...
              </div>
            ) : optionGroups.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Keine Optionen verfügbar
              </div>
            ) : (
              optionGroups.map(group => {
                const isSelected = (valueId: string) => (selectedOptions[group.id] || []).includes(valueId);
                const isRadio = group.maxSelection === 1;

                return (
                  <div key={group.id} className="border-t border-gray-100">
                    {/* Section Header */}
                    <div className="px-6 py-4 bg-stone-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{group.nameDe}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          group.isRequired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {group.isRequired ? `Pflicht (${group.minSelection}-${group.maxSelection})` : `Optional (${group.minSelection}-${group.maxSelection})`}
                        </span>
                      </div>
                      {group.nameEn && (
                        <p className="text-xs text-gray-500 mt-1">{group.nameEn}</p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="px-6 py-4 space-y-3">
                      {group.values.filter(v => v.isActive).map(value => {
                        const selected = isSelected(value.id);
                        
                        return (
                          <button
                            key={value.id}
                            onClick={() => handleOptionSelect(group.id, value.id)}
                            className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all text-left ${
                              selected
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center flex-1">
                              {/* Radio/Checkbox Indicator */}
                              <div className={`w-5 h-5 mr-3 flex items-center justify-center ${
                                isRadio ? 'rounded-full' : 'rounded'
                              } border-2 ${
                                selected
                                  ? 'border-gray-900 bg-gray-900'
                                  : 'border-gray-300'
                              }`}>
                                {selected && (
                                  <div className={`w-2.5 h-2.5 bg-white ${
                                    isRadio ? 'rounded-full' : 'rounded-sm'
                                  }`} />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{value.nameDe}</span>
                                {value.nameEn && (
                                  <span className="text-sm text-gray-600 ml-2">({value.nameEn})</span>
                                )}
                                {value.isDefault && (
                                  <span className="ml-2 text-xs text-blue-600">(Standard)</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Price display */}
                            {value.extraPrice > 0 && (
                              <span className="text-sm font-medium text-gray-700 ml-4">
                                +{value.extraPrice.toFixed(2)} €
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

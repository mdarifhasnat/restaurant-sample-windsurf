// ============================================================================
// ITEM DETAIL MODAL TYPES
// ============================================================================

export interface OptionValue {
  id: string;
  nameDe: string;
  nameEn: string | null;
  extraPrice: number;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface OptionGroup {
  id: string;
  productId: string;
  nameDe: string;
  nameEn: string | null;
  sortOrder: number;
  isActive: boolean;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  values: OptionValue[];
}

export interface MenuItemDetail {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  image: string;
  allergenInfo?: string;
  optionGroups: OptionGroup[];
}

export interface SelectedOptions {
  [groupId: string]: string[]; // For radio: single ID, for checkbox: array of IDs
}

export interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItemDetail;
  onAddToCart: (item: MenuItemDetail, quantity: number, selectedOptions: SelectedOptions, comments: string) => void;
}

// ============================================================================
// ITEM DETAIL MODAL TYPES
// ============================================================================

export interface OptionItem {
  id: string;
  label: string;
  priceAdd: number; // 0 if free
  infoText?: string; // allergen info
}

export interface OptionGroup {
  id: string;
  type: 'radio' | 'checkbox';
  title: string;
  helperText?: string;
  required: boolean;
  maxSelect?: number;
  options: OptionItem[];
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
  onAddToCart: (item: MenuItemDetail, quantity: number, selectedOptions: SelectedOptions) => void;
}

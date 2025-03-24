export interface Dish {
  id?: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  image?: string;
  priority: number;
  isAvailable: boolean;
  availableFor: string[]; // 'dine-in', 'takeaway', 'delivery'
  variants: DishVariant[];
  addons: DishAddon[];
}

export interface DishVariant {
  id?: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface DishAddon {
  id?: string;
  name: string;
  options: AddonOption[];
  required: boolean;
  multiSelect: boolean;
}

export interface AddonOption {
  id?: string;
  name: string;
  price: number;
}

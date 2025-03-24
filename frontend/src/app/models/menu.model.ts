export interface Category {
  _id: string;
  name: string;
  description?: string;
  restaurant: string;
  image?: string;
  isAvailable: boolean;
  displayOrder: number;
  createdAt?: Date;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  category: string | Category;
  restaurant: string;
  images?: string[];
  price: number;
  variants?: Variant[];
  addons?: Addon[];
  availability?: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
    roomService: boolean;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  preparationTime?: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  displayOrder: number;
  createdAt?: Date;
}

export interface Variant {
  _id?: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Addon {
  _id?: string;
  name: string;
  options: AddonOption[];
  required: boolean;
  multiple: boolean;
  min?: number;
  max?: number;
}

export interface AddonOption {
  _id?: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Order {
  id?: string;
  orderNumber: string;
  orderType: 'dine-in' | 'takeaway' | 'room-service' | 'delivery';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;

  // For dine-in orders
  tableNumber?: string;

  // For takeaway orders
  pickupTime?: Date;

  // For delivery orders
  deliveryAddress?: Address;
  deliveryTime?: Date;

  // For room service
  roomNumber?: string;

  // Customer information
  customer?: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface OrderItem {
  id?: string;
  dish: {
    id: string;
    name: string;
    image?: string;
  };
  variant: {
    id: string;
    name: string;
    price: number;
  };
  addons: {
    name: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
  quantity: number;
  specialInstructions?: string;
  itemTotal: number;
}

export interface Address {
  id?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  isDefault?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

import { OrderItem } from './order.model';

export interface Cart {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  orderType: 'dine-in' | 'takeaway' | 'room-service' | 'delivery';

  // For dine-in orders
  tableNumber?: string;

  // For takeaway orders
  pickupTime?: Date;

  // For delivery orders
  deliveryAddress?: {
    id?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryTime?: Date;

  // For room service
  roomNumber?: string;
}

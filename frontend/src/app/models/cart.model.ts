import { MenuItem, Variant, AddonOption } from './menu.model';

export interface CartItem {
  menuItem: string | MenuItem;
  quantity: number;
  variant?: string | Variant;
  addons?: {
    addon: string;
    option: string | AddonOption;
  }[];
  specialInstructions?: string;
}

export interface Cart {
  restaurantId: string;
  items: CartItem[];
  orderType: 'dine-in' | 'takeaway' | 'delivery' | 'room-service';
  orderDetails?: {
    dineIn?: {
      tableNumber: number;
      numberOfGuests: number;
    };
    takeaway?: {
      pickupTime: Date;
    };
    delivery?: {
      address: {
        _id?: string;
        title: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      };
      deliveryInstructions?: string;
    };
    roomService?: {
      roomNumber: string;
    };
  };
  promoCode?: string;
  specialInstructions?: string;
}

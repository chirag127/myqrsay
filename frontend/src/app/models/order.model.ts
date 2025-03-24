export interface Order {
  _id: string;
  orderNumber: string;
  customer?: string;
  restaurant: string;
  items: OrderItem[];
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
      estimatedDeliveryTime?: Date;
      deliveryFee?: number;
    };
    roomService?: {
      roomNumber: string;
    };
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'completed' | 'cancelled';
  statusHistory: StatusHistory[];
  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  tip?: number;
  total: number;
  promoCode?: string;
  payment: {
    method: 'cash' | 'card' | 'upi' | 'wallet';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paidAmount?: number;
    paidAt?: Date;
  };
  specialInstructions?: string;
  estimatedReadyTime?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
}

export interface OrderItem {
  menuItem: string;
  name: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    price: number;
  };
  addons?: {
    name: string;
    option: {
      name: string;
      price: number;
    };
  }[];
  specialInstructions?: string;
  subtotal: number;
}

export interface StatusHistory {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'completed' | 'cancelled';
  timestamp: Date;
  note?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  businessHours?: BusinessHour[];
  serviceTypes?: {
    dineIn?: {
      available: boolean;
      tables?: Table[];
    };
    takeaway?: {
      available: boolean;
      timeSlots?: TimeSlot[];
    };
    delivery?: {
      available: boolean;
      radius?: number;
      minOrderValue?: number;
      deliveryFee?: number;
    };
    roomService?: {
      available: boolean;
      rooms?: string[];
    };
  };
  taxSettings?: {
    taxPercentage: number;
    includeTaxInPrice: boolean;
  };
  currency?: string;
  owner: string;
  staff?: Staff[];
  isActive?: boolean;
  qrCode?: string;
  createdAt?: Date;
}

export interface BusinessHour {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: boolean;
  openTime: string;
  closeTime: string;
  breakTime?: {
    start: string;
    end: string;
  };
}

export interface Table {
  number: number;
  capacity: number;
  isAvailable: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  maxOrders: number;
}

export interface Staff {
  user: string;
  role: 'manager' | 'chef' | 'waiter' | 'cashier';
  permissions: string[];
}

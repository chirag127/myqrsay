export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'customer';
  addresses?: Address[];
  orderHistory?: string[]; // Order IDs
  createdAt?: Date;
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

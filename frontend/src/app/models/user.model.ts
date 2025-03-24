export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  addresses?: Address[];
  restaurantId?: string;
  socialProvider?: string;
  socialProviderId?: string;
  lastLogin?: Date;
  isActive?: boolean;
  createdAt?: Date;
}

export interface Address {
  _id?: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

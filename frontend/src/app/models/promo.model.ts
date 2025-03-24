export interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  restaurant: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: {
    total?: number;
    perUser?: number;
  };
  currentUsage?: {
    total: number;
    byUser: {
      user: string;
      count: number;
    }[];
  };
  applicableFor?: {
    orderTypes?: {
      dineIn: boolean;
      takeaway: boolean;
      delivery: boolean;
      roomService: boolean;
    };
    userTypes?: {
      newUsers: boolean;
      existingUsers: boolean;
    };
    categories?: string[];
    menuItems?: string[];
  };
  restrictions?: {
    daysOfWeek?: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    mealTimes?: {
      name: string;
      startTime: string;
      endTime: string;
    }[];
  };
  isActive: boolean;
  createdAt?: Date;
}

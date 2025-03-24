export interface PromoCode {
  id?: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  validMealTimes?: string[]; // 'breakfast', 'lunch', 'dinner'
  validDays?: string[]; // 'monday', 'tuesday', etc.
  usageLimit: number;
  perUserLimit: number;
  userType: 'new' | 'all';
  isActive: boolean;
}

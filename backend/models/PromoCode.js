const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a promo code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  usageLimit: {
    total: {
      type: Number
    },
    perUser: {
      type: Number,
      default: 1
    }
  },
  currentUsage: {
    total: {
      type: Number,
      default: 0
    },
    byUser: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  applicableFor: {
    orderTypes: {
      dineIn: {
        type: Boolean,
        default: true
      },
      takeaway: {
        type: Boolean,
        default: true
      },
      delivery: {
        type: Boolean,
        default: true
      },
      roomService: {
        type: Boolean,
        default: true
      }
    },
    userTypes: {
      newUsers: {
        type: Boolean,
        default: false
      },
      existingUsers: {
        type: Boolean,
        default: true
      }
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    menuItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    }]
  },
  restrictions: {
    daysOfWeek: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    },
    mealTimes: [{
      name: String,
      startTime: String,
      endTime: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PromoCode', PromoCodeSchema);

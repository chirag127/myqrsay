const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a restaurant name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  coverImage: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  businessHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: Boolean,
    openTime: String,
    closeTime: String,
    breakTime: {
      start: String,
      end: String
    }
  }],
  serviceTypes: {
    dineIn: {
      available: {
        type: Boolean,
        default: true
      },
      tables: [{
        number: Number,
        capacity: Number,
        isAvailable: {
          type: Boolean,
          default: true
        }
      }]
    },
    takeaway: {
      available: {
        type: Boolean,
        default: true
      },
      timeSlots: [{
        startTime: String,
        endTime: String,
        maxOrders: Number
      }]
    },
    delivery: {
      available: {
        type: Boolean,
        default: true
      },
      radius: Number,
      minOrderValue: Number,
      deliveryFee: Number
    },
    roomService: {
      available: {
        type: Boolean,
        default: false
      },
      rooms: [String]
    }
  },
  taxSettings: {
    taxPercentage: Number,
    includeTaxInPrice: Boolean
  },
  currency: {
    type: String,
    default: 'INR'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'chef', 'waiter', 'cashier']
    },
    permissions: [String]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);

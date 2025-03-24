const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    variant: {
      name: String,
      price: Number
    },
    addons: [{
      name: String,
      option: {
        name: String,
        price: Number
      }
    }],
    specialInstructions: String,
    subtotal: Number
  }],
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery', 'room-service'],
    required: true
  },
  orderDetails: {
    dineIn: {
      tableNumber: Number,
      numberOfGuests: Number
    },
    takeaway: {
      pickupTime: Date
    },
    delivery: {
      address: {
        title: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      deliveryInstructions: String,
      estimatedDeliveryTime: Date,
      deliveryFee: Number
    },
    roomService: {
      roomNumber: String
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out-for-delivery',
      'delivered',
      'completed',
      'cancelled'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out-for-delivery',
        'delivered',
        'completed',
        'cancelled'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tip: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  promoCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromoCode'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: Number,
    paidAt: Date
  },
  specialInstructions: String,
  estimatedReadyTime: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    // Get the restaurant code (first 3 letters of restaurant name)
    const restaurant = await mongoose.model('Restaurant').findById(this.restaurant);
    const restaurantCode = restaurant ? restaurant.name.substr(0, 3).toUpperCase() : 'RES';

    // Get count of orders for today
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      },
      restaurant: this.restaurant
    });

    // Generate order number: RESYYMMDD0001
    this.orderNumber = `${restaurantCode}${year}${month}${day}${('000' + (count + 1)).slice(-4)}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

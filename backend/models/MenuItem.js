const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a menu item name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  images: [String],
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  variants: [{
    name: String,
    price: Number,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  addons: [{
    name: String,
    options: [{
      name: String,
      price: Number,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    required: Boolean,
    multiple: Boolean,
    min: Number,
    max: Number
  }],
  availability: {
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
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  preparationTime: {
    type: Number,
    default: 15
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  allergens: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);

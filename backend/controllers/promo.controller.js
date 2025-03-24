const PromoCode = require('../models/PromoCode');

// @desc    Create promo code
// @route   POST /api/promos
// @access  Private/Admin
exports.createPromoCode = async (req, res) => {
  try {
    // Get restaurant ID from user
    const user = req.user;

    // Check if user has a restaurant
    if (!user.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a restaurant'
      });
    }

    // Add restaurant to request body
    req.body.restaurant = user.restaurantId;

    // Check if promo code already exists
    const existingPromo = await PromoCode.findOne({
      code: req.body.code,
      restaurant: user.restaurantId
    });

    if (existingPromo) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    // Create promo code
    const promoCode = await PromoCode.create(req.body);

    res.status(201).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all promo codes for a restaurant
// @route   GET /api/promos
// @access  Private/Admin
exports.getPromoCodes = async (req, res) => {
  try {
    // Get restaurant ID from user
    const user = req.user;

    // Check if user has a restaurant
    if (!user.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a restaurant'
      });
    }

    const promoCodes = await PromoCode.find({ restaurant: user.restaurantId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promoCodes.length,
      data: promoCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single promo code
// @route   GET /api/promos/:id
// @access  Private/Admin
exports.getPromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // Check if user owns the restaurant
    if (promoCode.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this promo code'
      });
    }

    res.status(200).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update promo code
// @route   PUT /api/promos/:id
// @access  Private/Admin
exports.updatePromoCode = async (req, res) => {
  try {
    let promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // Check if user owns the restaurant
    if (promoCode.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this promo code'
      });
    }

    // Check if code is being updated and already exists
    if (req.body.code && req.body.code !== promoCode.code) {
      const existingPromo = await PromoCode.findOne({
        code: req.body.code,
        restaurant: req.user.restaurantId
      });

      if (existingPromo) {
        return res.status(400).json({
          success: false,
          message: 'Promo code already exists'
        });
      }
    }

    promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete promo code
// @route   DELETE /api/promos/:id
// @access  Private/Admin
exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // Check if user owns the restaurant
    if (promoCode.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this promo code'
      });
    }

    await promoCode.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Validate promo code
// @route   POST /api/promos/validate
// @access  Private
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, restaurantId, orderType, subtotal } = req.body;

    if (!code || !restaurantId || !orderType || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, restaurantId, orderType and subtotal'
      });
    }

    // Find promo code
    const promoCode = await PromoCode.findOne({
      code,
      restaurant: restaurantId,
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check if promo code is applicable for the order type
    if (!promoCode.applicableFor.orderTypes[orderType.replace('-', '')]) {
      return res.status(400).json({
        success: false,
        message: `Promo code is not applicable for ${orderType}`
      });
    }

    // Check if minimum order value is met
    if (subtotal < promoCode.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ${promoCode.minOrderValue} required for this promo code`
      });
    }

    // Check if user is eligible (new user or existing user)
    if (promoCode.applicableFor.userTypes.newUsers && !promoCode.applicableFor.userTypes.existingUsers) {
      // Check if user has placed orders before
      const userOrders = await Order.countDocuments({
        customer: req.user.id,
        restaurant: restaurantId
      });

      if (userOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'Promo code is only applicable for new users'
        });
      }
    }

    // Check if promo code has usage limits
    if (promoCode.usageLimit.total && promoCode.currentUsage.total >= promoCode.usageLimit.total) {
      return res.status(400).json({
        success: false,
        message: 'Promo code usage limit reached'
      });
    }

    // Check if user has reached their usage limit
    const userUsage = promoCode.currentUsage.byUser.find(
      u => u.user.toString() === req.user.id
    );

    if (userUsage && promoCode.usageLimit.perUser && userUsage.count >= promoCode.usageLimit.perUser) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the usage limit for this promo code'
      });
    }

    // Check day of week restrictions
    const today = new Date().toLocaleLowerCase().split(' ')[0];
    if (!promoCode.restrictions.daysOfWeek[today]) {
      return res.status(400).json({
        success: false,
        message: `Promo code is not valid on ${today}`
      });
    }

    // Check meal time restrictions
    if (promoCode.restrictions.mealTimes && promoCode.restrictions.mealTimes.length > 0) {
      const now = new Date();
      const currentTime = `${now.getHours()}:${now.getMinutes()}`;

      const isValidMealTime = promoCode.restrictions.mealTimes.some(mealTime => {
        return currentTime >= mealTime.startTime && currentTime <= mealTime.endTime;
      });

      if (!isValidMealTime) {
        return res.status(400).json({
          success: false,
          message: 'Promo code is not valid at this time'
        });
      }
    }

    // Calculate discount
    let discount = 0;

    if (promoCode.discountType === 'percentage') {
      discount = (subtotal * promoCode.discountValue) / 100;

      // Apply max discount if specified
      if (promoCode.maxDiscountAmount && discount > promoCode.maxDiscountAmount) {
        discount = promoCode.maxDiscountAmount;
      }
    } else {
      discount = promoCode.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        promoCode,
        discount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

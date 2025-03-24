const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const PromoCode = require('../models/PromoCode');
const Restaurant = require('../models/Restaurant');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      orderType,
      orderDetails,
      promoCode,
      payment,
      specialInstructions
    } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Validate order type
    if (!restaurant.serviceTypes[orderType.replace('-', '')].available) {
      return res.status(400).json({
        success: false,
        message: `${orderType} service is not available for this restaurant`
      });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add items to your order'
      });
    }

    // Calculate order total
    let subtotal = 0;
    let orderItems = [];

    for (const item of items) {
      // Get menu item from database
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        });
      }

      // Check if item is available
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is not available`
        });
      }

      // Check if item is available for the order type
      if (!menuItem.availability[orderType.replace('-', '')]) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is not available for ${orderType}`
        });
      }

      // Calculate item price
      let itemPrice = menuItem.price;
      let variantName = '';

      // Add variant price if selected
      if (item.variant) {
        const variant = menuItem.variants.find(v => v._id.toString() === item.variant);

        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Variant not found for ${menuItem.name}`
          });
        }

        if (!variant.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `${variant.name} is not available for ${menuItem.name}`
          });
        }

        itemPrice = variant.price;
        variantName = variant.name;
      }

      // Add addons price
      let addons = [];

      if (item.addons && item.addons.length > 0) {
        for (const addon of item.addons) {
          const menuAddon = menuItem.addons.find(a => a._id.toString() === addon.addon);

          if (!menuAddon) {
            return res.status(404).json({
              success: false,
              message: `Addon not found for ${menuItem.name}`
            });
          }

          const option = menuAddon.options.find(o => o._id.toString() === addon.option);

          if (!option) {
            return res.status(404).json({
              success: false,
              message: `Option not found for addon in ${menuItem.name}`
            });
          }

          if (!option.isAvailable) {
            return res.status(400).json({
              success: false,
              message: `${option.name} is not available for ${menuItem.name}`
            });
          }

          itemPrice += option.price;

          addons.push({
            name: menuAddon.name,
            option: {
              name: option.name,
              price: option.price
            }
          });
        }
      }

      // Calculate item subtotal
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      // Add item to order items
      orderItems.push({
        menuItem: item.menuItem,
        name: menuItem.name,
        quantity: item.quantity,
        price: itemPrice,
        variant: item.variant ? {
          name: variantName,
          price: itemPrice
        } : undefined,
        addons,
        specialInstructions: item.specialInstructions,
        subtotal: itemSubtotal
      });
    }

    // Calculate tax
    const taxPercentage = restaurant.taxSettings.taxPercentage || 0;
    const tax = (subtotal * taxPercentage) / 100;

    // Calculate delivery fee
    let deliveryFee = 0;

    if (orderType === 'delivery') {
      deliveryFee = restaurant.serviceTypes.delivery.deliveryFee || 0;
    }

    // Apply promo code if provided
    let discount = 0;
    let promoCodeObj = null;

    if (promoCode) {
      promoCodeObj = await PromoCode.findOne({
        code: promoCode,
        restaurant: restaurantId,
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() }
      });

      if (!promoCodeObj) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired promo code'
        });
      }

      // Check if promo code is applicable for the order type
      if (!promoCodeObj.applicableFor.orderTypes[orderType.replace('-', '')]) {
        return res.status(400).json({
          success: false,
          message: `Promo code is not applicable for ${orderType}`
        });
      }

      // Check if minimum order value is met
      if (subtotal < promoCodeObj.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value of ${promoCodeObj.minOrderValue} required for this promo code`
        });
      }

      // Check if user is eligible (new user or existing user)
      if (promoCodeObj.applicableFor.userTypes.newUsers && !promoCodeObj.applicableFor.userTypes.existingUsers) {
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
      if (promoCodeObj.usageLimit.total && promoCodeObj.currentUsage.total >= promoCodeObj.usageLimit.total) {
        return res.status(400).json({
          success: false,
          message: 'Promo code usage limit reached'
        });
      }

      // Check if user has reached their usage limit
      const userUsage = promoCodeObj.currentUsage.byUser.find(
        u => u.user.toString() === req.user.id
      );

      if (userUsage && promoCodeObj.usageLimit.perUser && userUsage.count >= promoCodeObj.usageLimit.perUser) {
        return res.status(400).json({
          success: false,
          message: 'You have reached the usage limit for this promo code'
        });
      }

      // Calculate discount
      if (promoCodeObj.discountType === 'percentage') {
        discount = (subtotal * promoCodeObj.discountValue) / 100;

        // Apply max discount if specified
        if (promoCodeObj.maxDiscountAmount && discount > promoCodeObj.maxDiscountAmount) {
          discount = promoCodeObj.maxDiscountAmount;
        }
      } else {
        discount = promoCodeObj.discountValue;
      }
    }

    // Calculate total
    const total = subtotal + tax + deliveryFee - discount;

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      orderType,
      orderDetails,
      subtotal,
      tax,
      discount,
      deliveryFee,
      total,
      promoCode: promoCodeObj ? promoCodeObj._id : undefined,
      payment,
      specialInstructions,
      statusHistory: [{ status: 'pending' }]
    });

    // Update promo code usage if applied
    if (promoCodeObj) {
      // Increment total usage
      promoCodeObj.currentUsage.total += 1;

      // Update user usage
      const userIndex = promoCodeObj.currentUsage.byUser.findIndex(
        u => u.user.toString() === req.user.id
      );

      if (userIndex !== -1) {
        promoCodeObj.currentUsage.byUser[userIndex].count += 1;
      } else {
        promoCodeObj.currentUsage.byUser.push({
          user: req.user.id,
          count: 1
        });
      }

      await promoCodeObj.save();
    }

    // Emit socket event for new order
    req.io.to(`restaurant-${restaurantId}`).emit('newOrder', order);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all orders for a restaurant
// @route   GET /api/orders/restaurant
// @access  Private/Admin
exports.getRestaurantOrders = async (req, res) => {
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

    // Build query
    const query = { restaurant: user.restaurantId };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by order type if provided
    if (req.query.orderType) {
      query.orderType = req.query.orderType;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all orders for a customer
// @route   GET /api/orders/customer
// @access  Private
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name logo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name logo address contact')
      .populate('promoCode', 'code discountType discountValue');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (
      order.customer._id.toString() !== req.user.id &&
      order.restaurant._id.toString() !== req.user.restaurantId
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to update this order
    if (order.restaurant.toString() !== req.user.restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order status
    order.status = status;

    // Add status to history
    order.statusHistory.push({
      status,
      note
    });

    // Update timestamps based on status
    if (status === 'completed') {
      order.completedAt = Date.now();
    } else if (status === 'cancelled') {
      order.cancelledAt = Date.now();
      order.cancellationReason = note;
    }

    await order.save();

    // Emit socket event for order status update
    req.io.to(`order-${order._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status,
      statusHistory: order.statusHistory
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, transactionId, paidAmount } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to update this order
    if (
      order.customer.toString() !== req.user.id &&
      order.restaurant.toString() !== req.user.restaurantId
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update payment status
    order.payment.status = status;
    order.payment.transactionId = transactionId;
    order.payment.paidAmount = paidAmount;
    order.payment.paidAt = Date.now();

    await order.save();

    // Emit socket event for payment update
    req.io.to(`order-${order._id}`).emit('paymentUpdate', {
      orderId: order._id,
      paymentStatus: status
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to cancel this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['completed', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason;

    // Add status to history
    order.statusHistory.push({
      status: 'cancelled',
      note: reason
    });

    await order.save();

    // Emit socket event for order cancellation
    req.io.to(`restaurant-${order.restaurant}`).emit('orderCancelled', {
      orderId: order._id,
      reason
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to pay for this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if payment is already completed
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order'
      });
    }

    // Create Razorpay order
    const payment = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerName: req.user.name,
        customerEmail: req.user.email
      }
    });

    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        receipt: payment.receipt,
        orderId: order._id,
        key: process.env.RAZORPAY_KEY_ID
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

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order payment status
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update payment details
    order.payment.status = 'completed';
    order.payment.transactionId = razorpay_payment_id;
    order.payment.paidAmount = order.total;
    order.payment.paidAt = Date.now();

    // Update order status if it's pending
    if (order.status === 'pending') {
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        note: 'Payment completed'
      });
    }

    await order.save();

    // Emit socket event for payment update
    req.io.to(`order-${order._id}`).emit('paymentUpdate', {
      orderId: order._id,
      paymentStatus: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        paymentId: razorpay_payment_id,
        status: 'completed'
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

// @desc    Get payment details
// @route   GET /api/payments/:orderId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view payment details
    if (
      order.customer.toString() !== req.user.id &&
      order.restaurant.toString() !== req.user.restaurantId
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view payment details'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        status: order.payment.status,
        method: order.payment.method,
        transactionId: order.payment.transactionId,
        paidAmount: order.payment.paidAmount,
        paidAt: order.payment.paidAt
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

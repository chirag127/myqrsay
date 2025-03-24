const express = require('express');
const router = express.Router();
const {
  createOrder,
  getRestaurantOrders,
  getCustomerOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder);

router.route('/restaurant')
  .get(protect, authorize('admin', 'super-admin'), getRestaurantOrders);

router.route('/customer')
  .get(protect, getCustomerOrders);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, authorize('admin', 'super-admin'), updateOrderStatus);

router.route('/:id/payment')
  .put(protect, updatePaymentStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  getPaymentDetails
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

router.route('/create')
  .post(protect, createPayment);

router.route('/verify')
  .post(protect, verifyPayment);

router.route('/:orderId')
  .get(protect, getPaymentDetails);

module.exports = router;

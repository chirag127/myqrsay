const express = require('express');
const router = express.Router();
const {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode
} = require('../controllers/promo.controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'super-admin'), getPromoCodes)
  .post(protect, authorize('admin', 'super-admin'), createPromoCode);

router.route('/validate')
  .post(protect, validatePromoCode);

router.route('/:id')
  .get(protect, authorize('admin', 'super-admin'), getPromoCode)
  .put(protect, authorize('admin', 'super-admin'), updatePromoCode)
  .delete(protect, authorize('admin', 'super-admin'), deletePromoCode);

module.exports = router;

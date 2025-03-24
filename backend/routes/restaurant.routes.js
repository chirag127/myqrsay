const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addStaff,
  removeStaff
} = require('../controllers/restaurant.controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('admin', 'super-admin'), createRestaurant);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('admin', 'super-admin'), updateRestaurant)
  .delete(protect, authorize('admin', 'super-admin'), deleteRestaurant);

router.route('/:id/staff')
  .post(protect, authorize('admin', 'super-admin'), addStaff);

router.route('/:id/staff/:userId')
  .delete(protect, authorize('admin', 'super-admin'), removeStaff);

module.exports = router;

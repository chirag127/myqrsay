const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getAdminCategories,
  updateCategory,
  deleteCategory,
  createMenuItem,
  getMenuItems,
  getAdminMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth');

// Category routes
router.route('/categories')
  .get(getCategories)
  .post(protect, authorize('admin', 'super-admin'), createCategory);

router.route('/categories/admin')
  .get(protect, authorize('admin', 'super-admin'), getAdminCategories);

router.route('/categories/:id')
  .put(protect, authorize('admin', 'super-admin'), updateCategory)
  .delete(protect, authorize('admin', 'super-admin'), deleteCategory);

// Menu item routes
router.route('/items')
  .get(getMenuItems)
  .post(protect, authorize('admin', 'super-admin'), createMenuItem);

router.route('/items/admin')
  .get(protect, authorize('admin', 'super-admin'), getAdminMenuItems);

router.route('/items/:id')
  .get(getMenuItem)
  .put(protect, authorize('admin', 'super-admin'), updateMenuItem)
  .delete(protect, authorize('admin', 'super-admin'), deleteMenuItem);

module.exports = router;

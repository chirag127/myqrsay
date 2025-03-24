const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'super-admin'), getUsers)
  .post(protect, authorize('admin', 'super-admin'), createUser);

router.route('/profile')
  .put(protect, updateProfile);

router.route('/updatepassword')
  .put(protect, updatePassword);

router.route('/address')
  .post(protect, addAddress);

router.route('/address/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/:id')
  .get(protect, authorize('admin', 'super-admin'), getUser)
  .put(protect, authorize('admin', 'super-admin'), updateUser)
  .delete(protect, authorize('admin', 'super-admin'), deleteUser);

module.exports = router;

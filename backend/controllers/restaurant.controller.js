const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    // Add owner to request body
    req.body.owner = req.user.id;

    // Create restaurant
    const restaurant = await Restaurant.create(req.body);

    // Update user with restaurant ID
    await User.findByIdAndUpdate(req.user.id, { restaurantId: restaurant._id });

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'super-admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'super-admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this restaurant'
      });
    }

    await restaurant.remove();

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

// @desc    Add staff to restaurant
// @route   POST /api/restaurants/:id/staff
// @access  Private/Admin
exports.addStaff = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'super-admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    const { userId, role, permissions } = req.body;

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if staff already exists
    const staffExists = restaurant.staff.find(
      staff => staff.user.toString() === userId
    );

    if (staffExists) {
      return res.status(400).json({
        success: false,
        message: 'Staff already exists'
      });
    }

    // Add staff to restaurant
    restaurant.staff.push({
      user: userId,
      role,
      permissions
    });

    await restaurant.save();

    // Update user with restaurant ID
    await User.findByIdAndUpdate(userId, {
      restaurantId: restaurant._id,
      role: 'admin'
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Remove staff from restaurant
// @route   DELETE /api/restaurants/:id/staff/:userId
// @access  Private/Admin
exports.removeStaff = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'super-admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    // Check if staff exists
    const staffIndex = restaurant.staff.findIndex(
      staff => staff.user.toString() === req.params.userId
    );

    if (staffIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Remove staff from restaurant
    restaurant.staff.splice(staffIndex, 1);

    await restaurant.save();

    // Update user to remove restaurant ID
    await User.findByIdAndUpdate(req.params.userId, {
      restaurantId: null,
      role: 'customer'
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

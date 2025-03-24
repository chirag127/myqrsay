const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
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

    // Create category
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all categories for a restaurant
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a restaurant ID'
      });
    }

    const categories = await Category.find({
      restaurant: restaurantId,
      isAvailable: true
    }).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all categories for admin
// @route   GET /api/menu/categories/admin
// @access  Private/Admin
exports.getAdminCategories = async (req, res) => {
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

    const categories = await Category.find({
      restaurant: user.restaurantId
    }).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user owns the restaurant
    if (category.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this category'
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user owns the restaurant
    if (category.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this category'
      });
    }

    // Check if category has menu items
    const menuItems = await MenuItem.find({ category: req.params.id });

    if (menuItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with menu items'
      });
    }

    await category.remove();

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

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
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

    // Check if category exists and belongs to the restaurant
    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (category.restaurant.toString() !== user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add items to this category'
      });
    }

    // Create menu item
    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all menu items for a restaurant
// @route   GET /api/menu/items
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a restaurant ID'
      });
    }

    // Build query
    const query = {
      restaurant: restaurantId,
      isAvailable: true
    };

    // Add category to query if provided
    if (categoryId) {
      query.category = categoryId;
    }

    const menuItems = await MenuItem.find(query)
      .populate('category')
      .sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all menu items for admin
// @route   GET /api/menu/items/admin
// @access  Private/Admin
exports.getAdminMenuItems = async (req, res) => {
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

    // Add category to query if provided
    if (req.query.categoryId) {
      query.category = req.query.categoryId;
    }

    const menuItems = await MenuItem.find(query)
      .populate('category')
      .sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('category');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user owns the restaurant
    if (menuItem.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    // If category is being updated, check if it belongs to the restaurant
    if (req.body.category) {
      const category = await Category.findById(req.body.category);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (category.restaurant.toString() !== req.user.restaurantId.toString()) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to add items to this category'
        });
      }
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category');

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user owns the restaurant
    if (menuItem.restaurant.toString() !== req.user.restaurantId.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.remove();

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { validatePromoCode } from './promo-code';

const CART_STORAGE_KEY = 'restaurant_cart';
const TAX_RATE = 0.05; // 5% tax rate

// Initialize empty cart
const emptyCart = {
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  promoCode: null,
  orderType: 'dine-in',
  tableNumber: null,
  pickupTime: null,
  deliveryAddress: null,
  deliveryTime: null,
  roomNumber: null,
};

// Get cart from storage
export const getCart = async () => {
  try {
    const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (cartJson) {
      return JSON.parse(cartJson);
    }
    return { ...emptyCart };
  } catch (error) {
    console.log('Error getting cart:', error);
    return { ...emptyCart };
  }
};

// Save cart to storage
const saveCart = async (cart) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.log('Error saving cart:', error);
  }
};

// Recalculate cart totals
const recalculateCart = (cart) => {
  // Calculate subtotal
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

  // Calculate tax
  cart.tax = cart.subtotal * TAX_RATE;

  // Calculate total
  cart.total = cart.subtotal + cart.tax - cart.discount;

  return cart;
};

// Add item to cart
export const addToCart = async (item) => {
  try {
    const cart = await getCart();

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      i => i.dish.id === item.dish.id &&
           i.variant.id === item.variant.id &&
           JSON.stringify(i.addons) === JSON.stringify(item.addons)
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].itemTotal = cart.items[existingItemIndex].quantity *
        (cart.items[existingItemIndex].variant.price +
         cart.items[existingItemIndex].addons.reduce(
           (sum, addon) => sum + addon.options.reduce((s, opt) => s + opt.price, 0), 0
         ));
    } else {
      // Add new item
      cart.items.push(item);
    }

    const updatedCart = recalculateCart(cart);
    await saveCart(updatedCart);

    return updatedCart;
  } catch (error) {
    console.log('Error adding to cart:', error);
    return null;
  }
};

// Update item quantity
export const updateItemQuantity = async (index, quantity) => {
  try {
    const cart = await getCart();

    if (index >= 0 && index < cart.items.length) {
      cart.items[index].quantity = quantity;
      cart.items[index].itemTotal = quantity *
        (cart.items[index].variant.price +
         cart.items[index].addons.reduce(
           (sum, addon) => sum + addon.options.reduce((s, opt) => s + opt.price, 0), 0
         ));

      const updatedCart = recalculateCart(cart);
      await saveCart(updatedCart);

      return updatedCart;
    }

    return cart;
  } catch (error) {
    console.log('Error updating item quantity:', error);
    return null;
  }
};

// Remove item from cart
export const removeItem = async (index) => {
  try {
    const cart = await getCart();

    if (index >= 0 && index < cart.items.length) {
      cart.items.splice(index, 1);

      const updatedCart = recalculateCart(cart);
      await saveCart(updatedCart);

      return updatedCart;
    }

    return cart;
  } catch (error) {
    console.log('Error removing item:', error);
    return null;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    await saveCart({ ...emptyCart });
    return { ...emptyCart };
  } catch (error) {
    console.log('Error clearing cart:', error);
    return null;
  }
};

// Apply promo code
export const applyPromoCode = async (code) => {
  try {
    const cart = await getCart();

    const result = await validatePromoCode(code, cart.subtotal);

    if (result.success) {
      cart.promoCode = code;
      cart.discount = result.data.discount;

      const updatedCart = recalculateCart(cart);
      await saveCart(updatedCart);

      return { success: true, cart: updatedCart };
    }

    return {
      success: false,
      error: result.error || 'Invalid promo code.',
      cart
    };
  } catch (error) {
    console.log('Error applying promo code:', error);
    return { success: false, error: 'Failed to apply promo code.' };
  }
};

// Remove promo code
export const removePromoCode = async () => {
  try {
    const cart = await getCart();

    cart.promoCode = null;
    cart.discount = 0;

    const updatedCart = recalculateCart(cart);
    await saveCart(updatedCart);

    return updatedCart;
  } catch (error) {
    console.log('Error removing promo code:', error);
    return null;
  }
};

// Set order type
export const setOrderType = async (type) => {
  try {
    const cart = await getCart();

    cart.orderType = type;

    // Reset order-specific details when changing order type
    cart.tableNumber = null;
    cart.pickupTime = null;
    cart.deliveryAddress = null;
    cart.deliveryTime = null;
    cart.roomNumber = null;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting order type:', error);
    return null;
  }
};

// Set table number
export const setTableNumber = async (tableNumber) => {
  try {
    const cart = await getCart();

    cart.tableNumber = tableNumber;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting table number:', error);
    return null;
  }
};

// Set pickup time
export const setPickupTime = async (time) => {
  try {
    const cart = await getCart();

    cart.pickupTime = time;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting pickup time:', error);
    return null;
  }
};

// Set delivery address
export const setDeliveryAddress = async (address) => {
  try {
    const cart = await getCart();

    cart.deliveryAddress = address;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting delivery address:', error);
    return null;
  }
};

// Set delivery time
export const setDeliveryTime = async (time) => {
  try {
    const cart = await getCart();

    cart.deliveryTime = time;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting delivery time:', error);
    return null;
  }
};

// Set room number
export const setRoomNumber = async (roomNumber) => {
  try {
    const cart = await getCart();

    cart.roomNumber = roomNumber;

    await saveCart(cart);

    return cart;
  } catch (error) {
    console.log('Error setting room number:', error);
    return null;
  }
};

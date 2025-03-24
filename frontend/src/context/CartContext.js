import React, { createContext, useState, useEffect, useContext } from 'react';
import * as cartService from '../services/cart';

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from storage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Load cart from storage
  const loadCart = async () => {
    setIsLoading(true);
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.log('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (item) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.addToCart(item);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to add item to cart');
        return { success: false, error: 'Failed to add item to cart' };
      }
    } catch (error) {
      const errorMessage = 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (index, quantity) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.updateItemQuantity(index, quantity);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to update item quantity');
        return { success: false, error: 'Failed to update item quantity' };
      }
    } catch (error) {
      const errorMessage = 'Failed to update item quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (index) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.removeItem(index);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to remove item from cart');
        return { success: false, error: 'Failed to remove item from cart' };
      }
    } catch (error) {
      const errorMessage = 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const emptyCart = await cartService.clearCart();
      if (emptyCart) {
        setCart(emptyCart);
        return { success: true };
      } else {
        setError('Failed to clear cart');
        return { success: false, error: 'Failed to clear cart' };
      }
    } catch (error) {
      const errorMessage = 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Apply promo code
  const applyPromoCode = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cartService.applyPromoCode(code);

      if (result.success) {
        setCart(result.cart);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Failed to apply promo code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove promo code
  const removePromoCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.removePromoCode();
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to remove promo code');
        return { success: false, error: 'Failed to remove promo code' };
      }
    } catch (error) {
      const errorMessage = 'Failed to remove promo code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set order type
  const setOrderType = async (type) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setOrderType(type);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set order type');
        return { success: false, error: 'Failed to set order type' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set order type';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set table number
  const setTableNumber = async (tableNumber) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setTableNumber(tableNumber);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set table number');
        return { success: false, error: 'Failed to set table number' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set table number';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set pickup time
  const setPickupTime = async (time) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setPickupTime(time);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set pickup time');
        return { success: false, error: 'Failed to set pickup time' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set pickup time';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set delivery address
  const setDeliveryAddress = async (address) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setDeliveryAddress(address);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set delivery address');
        return { success: false, error: 'Failed to set delivery address' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set delivery address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set delivery time
  const setDeliveryTime = async (time) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setDeliveryTime(time);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set delivery time');
        return { success: false, error: 'Failed to set delivery time' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set delivery time';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Set room number
  const setRoomNumber = async (roomNumber) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.setRoomNumber(roomNumber);
      if (updatedCart) {
        setCart(updatedCart);
        return { success: true };
      } else {
        setError('Failed to set room number');
        return { success: false, error: 'Failed to set room number' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set room number';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    cart,
    isLoading,
    error,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
    setOrderType,
    setTableNumber,
    setPickupTime,
    setDeliveryAddress,
    setDeliveryTime,
    setRoomNumber,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart_data';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const cartJson = localStorage.getItem(this.cartKey);
    if (cartJson) {
      try {
        const cart = JSON.parse(cartJson);
        this.cartSubject.next(cart);
      } catch (error) {
        this.clearCart();
      }
    }
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  getCart(): Cart | null {
    return this.cartSubject.value;
  }

  initCart(restaurantId: string, orderType: string): void {
    const cart: Cart = {
      restaurantId,
      items: [],
      orderType: orderType as any
    };
    this.saveCartToStorage(cart);
  }

  addToCart(menuItem: MenuItem, quantity: number, variant?: string, addons?: any[], specialInstructions?: string): void {
    const cart = this.getCart();
    if (!cart) {
      throw new Error('Cart not initialized');
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => {
      const sameMenuItem = item.menuItem === menuItem._id ||
        (typeof item.menuItem !== 'string' && item.menuItem._id === menuItem._id);

      const sameVariant = (!variant && !item.variant) ||
        (variant && item.variant === variant) ||
        (variant && typeof item.variant !== 'string' && item.variant?._id === variant);

      // Check if addons are the same
      let sameAddons = (!addons && !item.addons) ||
        (addons && item.addons && addons.length === item.addons.length);

      if (sameAddons && addons && item.addons) {
        // Compare each addon
        for (const addon of addons) {
          const matchingAddon = item.addons.find(a =>
            a.addon === addon.addon && a.option === addon.option
          );
          if (!matchingAddon) {
            sameAddons = false;
            break;
          }
        }
      }

      return sameMenuItem && sameVariant && sameAddons;
    });

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: menuItem._id,
        quantity,
        variant,
        addons,
        specialInstructions
      });
    }

    this.saveCartToStorage(cart);
  }

  updateCartItem(index: number, quantity: number): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    if (index >= 0 && index < cart.items.length) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(index, 1);
      } else {
        // Update quantity
        cart.items[index].quantity = quantity;
      }

      this.saveCartToStorage(cart);
    }
  }

  removeCartItem(index: number): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    if (index >= 0 && index < cart.items.length) {
      cart.items.splice(index, 1);
      this.saveCartToStorage(cart);
    }
  }

  updateOrderType(orderType: string): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    cart.orderType = orderType as any;
    this.saveCartToStorage(cart);
  }

  updateOrderDetails(orderDetails: any): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    cart.orderDetails = orderDetails;
    this.saveCartToStorage(cart);
  }

  applyPromoCode(promoCode: string): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    cart.promoCode = promoCode;
    this.saveCartToStorage(cart);
  }

  removePromoCode(): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    cart.promoCode = undefined;
    this.saveCartToStorage(cart);
  }

  updateSpecialInstructions(instructions: string): void {
    const cart = this.getCart();
    if (!cart) {
      return;
    }

    cart.specialInstructions = instructions;
    this.saveCartToStorage(cart);
  }

  getItemCount(): number {
    const cart = this.getCart();
    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(items: CartItem[]): number {
    let subtotal = 0;

    for (const item of items) {
      let itemPrice = 0;

      // Get base price from menu item
      if (typeof item.menuItem !== 'string') {
        itemPrice = item.menuItem.price;

        // Add variant price if selected
        if (item.variant && typeof item.variant !== 'string') {
          itemPrice = item.variant.price;
        }

        // Add addon prices
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            if (addon.option && typeof addon.option !== 'string') {
              itemPrice += addon.option.price;
            }
          }
        }

        subtotal += itemPrice * item.quantity;
      }
    }

    return subtotal;
  }

  clearCart(): void {
    localStorage.removeItem(this.cartKey);
    this.cartSubject.next(null);
  }

  isCartEmpty(): boolean {
    const cart = this.getCart();
    return !cart || cart.items.length === 0;
  }

  canCheckout(): boolean {
    const cart = this.getCart();
    if (!cart || cart.items.length === 0) {
      return false;
    }

    // Check if order details are provided based on order type
    if (cart.orderType === 'dine-in' && (!cart.orderDetails?.dineIn?.tableNumber || !cart.orderDetails?.dineIn?.numberOfGuests)) {
      return false;
    }

    if (cart.orderType === 'takeaway' && !cart.orderDetails?.takeaway?.pickupTime) {
      return false;
    }

    if (cart.orderType === 'delivery' && !cart.orderDetails?.delivery?.address) {
      return false;
    }

    if (cart.orderType === 'room-service' && !cart.orderDetails?.roomService?.roomNumber) {
      return false;
    }

    return true;
  }
}

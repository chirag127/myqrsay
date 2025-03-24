import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from '../models/cart.model';
import { OrderItem } from '../models/order.model';
import { PromoCodeService } from './promo-code.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly TAX_RATE = 0.05; // 5% tax rate
  private readonly STORAGE_KEY = 'restaurant_cart';

  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    orderType: 'dine-in'
  });

  public cart$ = this.cartSubject.asObservable();

  constructor(private promoCodeService: PromoCodeService) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const cartJson = localStorage.getItem(this.STORAGE_KEY);
    if (cartJson) {
      try {
        const cart = JSON.parse(cartJson);
        this.cartSubject.next(cart);
      } catch (error) {
        console.error('Error parsing cart from localStorage', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  private recalculateCart(cart: Cart): Cart {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

    // Calculate tax
    cart.tax = cart.subtotal * this.TAX_RATE;

    // Calculate total
    cart.total = cart.subtotal + cart.tax - cart.discount;

    return cart;
  }

  getCart(): Observable<Cart> {
    return this.cart$;
  }

  addToCart(item: OrderItem): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
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

      const updatedCart = this.recalculateCart(cart);
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
    });
  }

  updateItemQuantity(index: number, quantity: number): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      if (index >= 0 && index < cart.items.length) {
        cart.items[index].quantity = quantity;
        cart.items[index].itemTotal = quantity *
          (cart.items[index].variant.price +
           cart.items[index].addons.reduce(
             (sum, addon) => sum + addon.options.reduce((s, opt) => s + opt.price, 0), 0
           ));

        const updatedCart = this.recalculateCart(cart);
        this.cartSubject.next(updatedCart);
        this.saveCartToStorage(updatedCart);
      }
    });
  }

  removeItem(index: number): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      if (index >= 0 && index < cart.items.length) {
        cart.items.splice(index, 1);

        const updatedCart = this.recalculateCart(cart);
        this.cartSubject.next(updatedCart);
        this.saveCartToStorage(updatedCart);
      }
    });
  }

  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      orderType: 'dine-in'
    };

    this.cartSubject.next(emptyCart);
    this.saveCartToStorage(emptyCart);
  }

  applyPromoCode(code: string): Observable<boolean> {
    return this.cart$.pipe(
      take(1),
      map(cart => {
        return this.promoCodeService.validatePromoCode(code, cart.subtotal).pipe(
          map(result => {
            if (result.valid) {
              cart.promoCode = code;
              cart.discount = result.discount;
              const updatedCart = this.recalculateCart(cart);
              this.cartSubject.next(updatedCart);
              this.saveCartToStorage(updatedCart);
              return true;
            }
            return false;
          })
        );
      })
    ) as Observable<boolean>;
  }

  removePromoCode(): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.promoCode = undefined;
      cart.discount = 0;

      const updatedCart = this.recalculateCart(cart);
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
    });
  }

  setOrderType(type: 'dine-in' | 'takeaway' | 'room-service' | 'delivery'): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.orderType = type;

      // Reset order-specific details when changing order type
      cart.tableNumber = undefined;
      cart.pickupTime = undefined;
      cart.deliveryAddress = undefined;
      cart.deliveryTime = undefined;
      cart.roomNumber = undefined;

      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }

  setTableNumber(tableNumber: string): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.tableNumber = tableNumber;
      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }

  setPickupTime(time: Date): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.pickupTime = time;
      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }

  setDeliveryAddress(address: any): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.deliveryAddress = address;
      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }

  setDeliveryTime(time: Date): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.deliveryTime = time;
      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }

  setRoomNumber(roomNumber: string): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      cart.roomNumber = roomNumber;
      this.cartSubject.next(cart);
      this.saveCartToStorage(cart);
    });
  }
}

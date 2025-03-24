import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../services/cart.service';
import { RestaurantService } from '../../services/restaurant.service';
import { PromoService } from '../../services/promo.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Restaurant } from '../../models/restaurant.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  restaurant: Restaurant | null = null;
  currentUser: User | null = null;
  isLoggedIn = false;
  loading = true;
  loadingPromo = false;
  error = '';
  subtotal = 0;
  tax = 0;
  discount = 0;
  deliveryFee = 0;
  total = 0;

  orderTypeForm!: FormGroup;
  promoCodeForm!: FormGroup;
  specialInstructionsForm!: FormGroup;

  promoCodeApplied = false;
  promoCodeError = '';

  orderTypes = [
    { value: 'dine-in', label: 'Dine-in' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'room-service', label: 'Room Service' }
  ];

  constructor(
    private cartService: CartService,
    private restaurantService: RestaurantService,
    private promoService: PromoService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;

      if (cart) {
        this.loadRestaurant(cart.restaurantId);
        this.updateOrderTypeForm(cart.orderType);
        this.updateSpecialInstructionsForm(cart.specialInstructions);

        if (cart.promoCode) {
          this.promoCodeForm.get('code')?.setValue(cart.promoCode);
          this.promoCodeApplied = true;
        }
      } else {
        this.loading = false;
      }
    });
  }

  initForms(): void {
    this.orderTypeForm = this.fb.group({
      orderType: ['dine-in', Validators.required]
    });

    this.promoCodeForm = this.fb.group({
      code: ['', Validators.required]
    });

    this.specialInstructionsForm = this.fb.group({
      instructions: ['']
    });

    // Listen for order type changes
    this.orderTypeForm.get('orderType')?.valueChanges.subscribe(value => {
      if (this.cart) {
        this.cartService.updateOrderType(value);
      }
    });
  }

  loadRestaurant(restaurantId: string): void {
    this.loading = true;
    this.restaurantService.getRestaurant(restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant details';
        this.loading = false;
      }
    });
  }

  updateOrderTypeForm(orderType: string): void {
    this.orderTypeForm.get('orderType')?.setValue(orderType);
  }

  updateSpecialInstructionsForm(instructions?: string): void {
    this.specialInstructionsForm.get('instructions')?.setValue(instructions || '');
  }

  calculateTotals(): void {
    if (!this.cart || !this.restaurant) return;

    // Calculate subtotal
    this.subtotal = this.cartService.getSubtotal(this.cart.items);

    // Calculate tax
    const taxRate = this.restaurant.taxSettings?.taxPercentage || 0;
    this.tax = (this.subtotal * taxRate) / 100;

    // Calculate delivery fee
    this.deliveryFee = 0;
    if (this.cart.orderType === 'delivery' && this.restaurant.serviceTypes?.delivery?.deliveryFee) {
      this.deliveryFee = this.restaurant.serviceTypes.delivery.deliveryFee;
    }

    // Calculate total
    this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;
  }

  updateCartItemQuantity(index: number, quantity: number): void {
    this.cartService.updateCartItem(index, quantity);
    this.calculateTotals();
  }

  removeCartItem(index: number): void {
    this.cartService.removeCartItem(index);
    this.calculateTotals();

    this.snackBar.open('Item removed from cart', 'Close', {
      duration: 3000
    });
  }

  applyPromoCode(): void {
    const code = this.promoCodeForm.get('code')?.value;
    if (!code || !this.cart || !this.restaurant) return;

    this.loadingPromo = true;
    this.promoCodeError = '';

    this.promoService.validatePromoCode(
      code,
      this.restaurant._id,
      this.cart.orderType,
      this.subtotal
    ).subscribe({
      next: (result) => {
        this.discount = result.discount;
        this.cartService.applyPromoCode(code);
        this.promoCodeApplied = true;
        this.calculateTotals();
        this.loadingPromo = false;

        this.snackBar.open(`Promo code applied: ${result.message}`, 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.promoCodeError = error.error?.message || 'Invalid promo code';
        this.promoCodeApplied = false;
        this.discount = 0;
        this.calculateTotals();
        this.loadingPromo = false;
      }
    });
  }

  removePromoCode(): void {
    this.cartService.removePromoCode();
    this.promoCodeForm.get('code')?.setValue('');
    this.promoCodeApplied = false;
    this.discount = 0;
    this.calculateTotals();

    this.snackBar.open('Promo code removed', 'Close', {
      duration: 3000
    });
  }

  updateSpecialInstructions(): void {
    const instructions = this.specialInstructionsForm.get('instructions')?.value;
    this.cartService.updateSpecialInstructions(instructions);

    this.snackBar.open('Special instructions updated', 'Close', {
      duration: 3000
    });
  }

  proceedToCheckout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (this.cartService.canCheckout()) {
      this.router.navigate(['/checkout']);
    } else {
      // Determine what's missing
      if (!this.cart) {
        this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
        return;
      }

      if (this.cart.orderType === 'dine-in' && (!this.cart.orderDetails?.dineIn?.tableNumber || !this.cart.orderDetails?.dineIn?.numberOfGuests)) {
        this.snackBar.open('Please provide table number and number of guests', 'Close', { duration: 3000 });
        this.router.navigate(['/order-details']);
        return;
      }

      if (this.cart.orderType === 'takeaway' && !this.cart.orderDetails?.takeaway?.pickupTime) {
        this.snackBar.open('Please select a pickup time', 'Close', { duration: 3000 });
        this.router.navigate(['/order-details']);
        return;
      }

      if (this.cart.orderType === 'delivery' && !this.cart.orderDetails?.delivery?.address) {
        this.snackBar.open('Please provide a delivery address', 'Close', { duration: 3000 });
        this.router.navigate(['/order-details']);
        return;
      }

      if (this.cart.orderType === 'room-service' && !this.cart.orderDetails?.roomService?.roomNumber) {
        this.snackBar.open('Please provide a room number', 'Close', { duration: 3000 });
        this.router.navigate(['/order-details']);
        return;
      }
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('Cart cleared', 'Close', { duration: 3000 });
  }

  continueShopping(): void {
    if (this.restaurant) {
      this.router.navigate(['/menu', this.restaurant._id]);
    } else {
      this.router.navigate(['/restaurants']);
    }
  }
}

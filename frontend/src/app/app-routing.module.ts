import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RestaurantListComponent } from './components/restaurant/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './components/restaurant/restaurant-detail/restaurant-detail.component';
import { RestaurantFormComponent } from './components/restaurant/restaurant-form/restaurant-form.component';
import { MenuListComponent } from './components/menu/menu-list/menu-list.component';
import { MenuItemDetailComponent } from './components/menu/menu-item-detail/menu-item-detail.component';
import { MenuItemFormComponent } from './components/menu/menu-item-form/menu-item-form.component';
import { CategoryListComponent } from './components/category/category-list/category-list.component';
import { CategoryFormComponent } from './components/category/category-form/category-form.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderListComponent } from './components/order/order-list/order-list.component';
import { OrderDetailComponent } from './components/order/order-detail/order-detail.component';
import { PromoCodeListComponent } from './components/promo/promo-code-list/promo-code-list.component';
import { PromoCodeFormComponent } from './components/promo/promo-code-form/promo-code-form.component';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';
import { OrderManagementComponent } from './components/admin/order-management/order-management.component';
import { KitchenDisplayComponent } from './components/admin/kitchen-display/kitchen-display.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'restaurants', component: RestaurantListComponent },
  { path: 'restaurants/:id', component: RestaurantDetailComponent },
  { path: 'menu/:restaurantId', component: MenuListComponent },
  { path: 'menu/item/:id', component: MenuItemDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [AuthGuard] },
  { path: 'qr/:restaurantId', component: QrCodeComponent },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'restaurant/new', component: RestaurantFormComponent },
      { path: 'restaurant/edit/:id', component: RestaurantFormComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/new', component: CategoryFormComponent },
      { path: 'categories/edit/:id', component: CategoryFormComponent },
      { path: 'menu-items', component: MenuListComponent },
      { path: 'menu-items/new', component: MenuItemFormComponent },
      { path: 'menu-items/edit/:id', component: MenuItemFormComponent },
      { path: 'promo-codes', component: PromoCodeListComponent },
      { path: 'promo-codes/new', component: PromoCodeFormComponent },
      { path: 'promo-codes/edit/:id', component: PromoCodeFormComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'orders', component: OrderManagementComponent },
      { path: 'kitchen', component: KitchenDisplayComponent },
      { path: 'qr-code', component: QrCodeComponent }
    ]
  },

  // Wildcard route for 404
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

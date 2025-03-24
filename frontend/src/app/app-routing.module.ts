import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/menu/menu.module').then(m => m.MenuModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'promo-codes',
    loadChildren: () => import('./features/promo-codes/promo-codes.module').then(m => m.PromoCodesModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

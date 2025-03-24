import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Check if route requires admin role
      if (route.data['roles'] && route.data['roles'].includes('admin') && !this.authService.isAdmin()) {
        this.router.navigate(['/unauthorized']);
        return false;
      }

      // Check if route requires staff role
      if (route.data['roles'] && route.data['roles'].includes('staff') && !this.authService.isStaff()) {
        this.router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    }

    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

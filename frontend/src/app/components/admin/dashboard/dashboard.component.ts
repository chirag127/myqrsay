import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../models/order.model';
import { Restaurant } from '../../../models/restaurant.model';
import { MenuItem } from '../../../models/menu.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  restaurant: Restaurant | null = null;
  recentOrders: Order[] = [];
  popularItems: MenuItem[] = [];
  totalOrders = 0;
  totalRevenue = 0;
  todayOrders = 0;
  todayRevenue = 0;
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.restaurantId) {
        this.loadRestaurantData(user.restaurantId);
        this.loadOrderData();
      } else {
        this.loading = false;
      }
    });
  }

  loadRestaurantData(restaurantId: string): void {
    this.restaurantService.getRestaurant(restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant data';
        this.loading = false;
      }
    });
  }

  loadOrderData(): void {
    // Get recent orders
    this.orderService.getRestaurantOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5);

        // Calculate total orders and revenue
        this.totalOrders = orders.length;
        this.totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Calculate today's orders and revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });

        this.todayOrders = todayOrders.length;
        this.todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

        // Get popular menu items
        this.loadPopularItems(orders);

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load order data';
        this.loading = false;
      }
    });
  }

  loadPopularItems(orders: Order[]): void {
    // Create a map to count item occurrences
    const itemCounts = new Map<string, { count: number, name: string }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = typeof item.menuItem === 'string' ? item.menuItem : item.menuItem._id;
        if (itemCounts.has(itemId)) {
          const current = itemCounts.get(itemId);
          if (current) {
            current.count += item.quantity;
          }
        } else {
          itemCounts.set(itemId, { count: item.quantity, name: item.name });
        }
      });
    });

    // Convert map to array and sort by count
    const sortedItems = Array.from(itemCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    // Load full menu item details
    if (sortedItems.length > 0 && this.currentUser?.restaurantId) {
      this.menuService.getAdminMenuItems().subscribe({
        next: (menuItems) => {
          this.popularItems = sortedItems.map(([id, data]) => {
            const menuItem = menuItems.find(item => item._id === id);
            return menuItem || {
              _id: id,
              name: data.name,
              price: 0,
              category: '',
              restaurant: this.currentUser?.restaurantId || '',
              isAvailable: true,
              displayOrder: 0
            };
          });
        },
        error: (error) => {
          console.error('Failed to load menu items', error);
        }
      });
    }
  }
}

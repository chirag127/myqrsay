import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredRestaurants: Restaurant[] = [];
  loading = true;
  error = '';

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.loadFeaturedRestaurants();
  }

  loadFeaturedRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.featuredRestaurants = restaurants.filter(r => r.isActive).slice(0, 6);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurants. Please try again later.';
        this.loading = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { Restaurant } from '../../models/restaurant.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  restaurant: Restaurant | null = null;
  currentUser: User | null = null;
  isAdmin = false;
  loading = true;
  error = '';
  qrCodeUrl = '';
  qrCodeForm!: FormGroup;
  qrCodeSize = 300;
  qrCodeData = '';
  baseUrl = window.location.origin;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

      const restaurantId = this.route.snapshot.paramMap.get('restaurantId') ||
                          (user?.restaurantId ? user.restaurantId : '');

      if (restaurantId) {
        this.loadRestaurant(restaurantId);
      } else if (this.isAdmin) {
        this.loading = false;
      } else {
        this.error = 'No restaurant specified';
        this.loading = false;
      }
    });
  }

  initForm(): void {
    this.qrCodeForm = this.fb.group({
      tableNumber: ['', [Validators.required, Validators.min(1)]],
      includeTable: [true]
    });

    // Listen for form changes
    this.qrCodeForm.valueChanges.subscribe(() => {
      this.generateQrCodeData();
    });
  }

  loadRestaurant(id: string): void {
    this.loading = true;
    this.restaurantService.getRestaurant(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.generateQrCodeData();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant';
        this.loading = false;
      }
    });
  }

  generateQrCodeData(): void {
    if (!this.restaurant) return;

    const includeTable = this.qrCodeForm.get('includeTable')?.value;
    const tableNumber = this.qrCodeForm.get('tableNumber')?.value;

    let url = `${this.baseUrl}/menu/${this.restaurant._id}`;

    if (includeTable && tableNumber) {
      url += `?table=${tableNumber}`;
    }

    this.qrCodeData = url;
    this.generateQrCode();
  }

  generateQrCode(): void {
    // In a real app, you would use a QR code generation library
    // For now, we'll use a placeholder URL from a QR code generation service
    const encodedData = encodeURIComponent(this.qrCodeData);
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${this.qrCodeSize}x${this.qrCodeSize}&data=${encodedData}`;
  }

  downloadQrCode(): void {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `qrcode-${this.restaurant?.name}-${this.qrCodeForm.get('tableNumber')?.value || 'menu'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printQrCode(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${this.restaurant?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
              .qr-container { margin: 20px auto; max-width: 400px; }
              img { max-width: 100%; height: auto; }
              h1 { margin-bottom: 5px; }
              p { margin-top: 5px; color: #666; }
            </style>
          </head>
          <body>
            <h1>${this.restaurant?.name}</h1>
            <p>Scan to view our digital menu</p>
            ${this.qrCodeForm.get('includeTable')?.value && this.qrCodeForm.get('tableNumber')?.value ?
              `<p>Table #${this.qrCodeForm.get('tableNumber')?.value}</p>` : ''}
            <div class="qr-container">
              <img src="${this.qrCodeUrl}" alt="QR Code">
            </div>
            <p>${this.qrCodeData}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  increaseSize(): void {
    this.qrCodeSize += 50;
    if (this.qrCodeSize > 1000) this.qrCodeSize = 1000;
    this.generateQrCode();
  }

  decreaseSize(): void {
    this.qrCodeSize -= 50;
    if (this.qrCodeSize < 100) this.qrCodeSize = 100;
    this.generateQrCode();
  }
}

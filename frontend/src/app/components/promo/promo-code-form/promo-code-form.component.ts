import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromoService } from '../../../services/promo.service';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { PromoCode } from '../../../models/promo.model';
import { Category } from '../../../models/menu.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-promo-code-form',
  templateUrl: './promo-code-form.component.html',
  styleUrls: ['./promo-code-form.component.scss']
})
export class PromoCodeFormComponent implements OnInit {
  promoForm!: FormGroup;
  currentUser: User | null = null;
  promoCode: PromoCode | null = null;
  categories: Category[] = [];
  menuItems: any[] = [];
  isEditMode = false;
  loading = false;
  submitting = false;
  daysOfWeek = [
    { name: 'Monday', value: 'monday' },
    { name: 'Tuesday', value: 'tuesday' },
    { name: 'Wednesday', value: 'wednesday' },
    { name: 'Thursday', value: 'thursday' },
    { name: 'Friday', value: 'friday' },
    { name: 'Saturday', value: 'saturday' },
    { name: 'Sunday', value: 'sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private promoService: PromoService,
    private menuService: MenuService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.restaurantId) {
        this.loadCategories();
        this.loadMenuItems();
      }
    });

    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadPromoCode(id);
    }
  }

  initForm(): void {
    this.promoForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_-]{3,15}$/)]],
      description: ['', Validators.maxLength(200)],
      discountType: ['percentage', Validators.required],
      discountValue: [10, [Validators.required, Validators.min(0)]],
      minOrderValue: [0, [Validators.required, Validators.min(0)]],
      maxDiscountAmount: [null],
      validFrom: [new Date(), Validators.required],
      validTo: [new Date(new Date().setMonth(new Date().getMonth() + 1)), Validators.required],
      usageLimit: this.fb.group({
        total: [null],
        perUser: [1, Validators.min(1)]
      }),
      applicableFor: this.fb.group({
        orderTypes: this.fb.group({
          dineIn: [true],
          takeaway: [true],
          delivery: [true],
          roomService: [true]
        }),
        userTypes: this.fb.group({
          newUsers: [false],
          existingUsers: [true]
        }),
        categories: [[]],
        menuItems: [[]]
      }),
      restrictions: this.fb.group({
        daysOfWeek: this.fb.group({
          monday: [true],
          tuesday: [true],
          wednesday: [true],
          thursday: [true],
          friday: [true],
          saturday: [true],
          sunday: [true]
        }),
        mealTimes: this.fb.array([])
      }),
      isActive: [true]
    });

    // Add a default meal time
    this.addMealTime();
  }

  loadCategories(): void {
    this.loading = true;
    this.menuService.getAdminCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadMenuItems(): void {
    this.loading = true;
    this.menuService.getAdminMenuItems().subscribe({
      next: (menuItems) => {
        this.menuItems = menuItems;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load menu items', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadPromoCode(id: string): void {
    this.loading = true;
    this.promoService.getPromoCode(id).subscribe({
      next: (promoCode) => {
        this.promoCode = promoCode;
        this.patchFormValues(promoCode);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load promo code', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/admin/promo-codes']);
      }
    });
  }

  patchFormValues(promoCode: PromoCode): void {
    // Clear meal times array
    this.mealTimesArray.clear();

    // Convert dates to Date objects
    const validFrom = new Date(promoCode.validFrom);
    const validTo = new Date(promoCode.validTo);

    // Patch basic fields
    this.promoForm.patchValue({
      code: promoCode.code,
      description: promoCode.description || '',
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minOrderValue: promoCode.minOrderValue,
      maxDiscountAmount: promoCode.maxDiscountAmount,
      validFrom,
      validTo,
      usageLimit: promoCode.usageLimit || {
        total: null,
        perUser: 1
      },
      applicableFor: {
        orderTypes: promoCode.applicableFor?.orderTypes || {
          dineIn: true,
          takeaway: true,
          delivery: true,
          roomService: true
        },
        userTypes: promoCode.applicableFor?.userTypes || {
          newUsers: false,
          existingUsers: true
        },
        categories: promoCode.applicableFor?.categories || [],
        menuItems: promoCode.applicableFor?.menuItems || []
      },
      restrictions: {
        daysOfWeek: promoCode.restrictions?.daysOfWeek || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        }
      },
      isActive: promoCode.isActive
    });

    // Add meal times
    if (promoCode.restrictions?.mealTimes && promoCode.restrictions.mealTimes.length > 0) {
      promoCode.restrictions.mealTimes.forEach(mealTime => {
        this.addMealTime(mealTime);
      });
    } else {
      this.addMealTime();
    }
  }

  // Meal times methods
  get mealTimesArray(): FormArray {
    return this.promoForm.get('restrictions')?.get('mealTimes') as FormArray;
  }

  addMealTime(mealTime?: any): void {
    this.mealTimesArray.push(this.fb.group({
      name: [mealTime ? mealTime.name : '', Validators.required],
      startTime: [mealTime ? mealTime.startTime : '08:00', Validators.required],
      endTime: [mealTime ? mealTime.endTime : '22:00', Validators.required]
    }));
  }

  removeMealTime(index: number): void {
    this.mealTimesArray.removeAt(index);
  }

  // Form submission
  onSubmit(): void {
    if (this.promoForm.invalid) {
      this.markFormGroupTouched(this.promoForm);
      this.snackBar.open('Please fix the errors in the form', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formData = this.prepareFormData();

    if (this.isEditMode && this.promoCode) {
      this.promoService.updatePromoCode(this.promoCode._id, formData).subscribe({
        next: (updatedPromo) => {
          this.snackBar.open('Promo code updated successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          this.router.navigate(['/admin/promo-codes']);
        },
        error: (error) => {
          this.snackBar.open('Failed to update promo code', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      this.promoService.createPromoCode(formData).subscribe({
        next: (newPromo) => {
          this.snackBar.open('Promo code created successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          this.router.navigate(['/admin/promo-codes']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create promo code', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  prepareFormData(): any {
    const formValue = this.promoForm.value;

    // Ensure code is uppercase
    formValue.code = formValue.code.toUpperCase();

    // Add restaurant ID
    if (this.currentUser && this.currentUser.restaurantId) {
      formValue.restaurant = this.currentUser.restaurantId;
    }

    return formValue;
  }

  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  // Helper method to generate a random promo code
  generateRandomCode(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.promoForm.get('code')?.setValue(result);
  }
}

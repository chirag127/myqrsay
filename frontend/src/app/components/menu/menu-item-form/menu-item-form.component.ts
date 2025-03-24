import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { MenuItem, Category, Variant, Addon, AddonOption } from '../../../models/menu.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-menu-item-form',
  templateUrl: './menu-item-form.component.html',
  styleUrls: ['./menu-item-form.component.scss']
})
export class MenuItemFormComponent implements OnInit {
  menuItemForm!: FormGroup;
  categories: Category[] = [];
  currentUser: User | null = null;
  menuItem: MenuItem | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
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
      if (user) {
        this.loadCategories();
      }
    });

    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadMenuItem(id);
    }
  }

  initForm(): void {
    this.menuItemForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      variants: this.fb.array([]),
      addons: this.fb.array([]),
      availability: this.fb.group({
        dineIn: [true],
        takeaway: [true],
        delivery: [true],
        roomService: [true]
      }),
      isVegetarian: [false],
      isVegan: [false],
      isGlutenFree: [false],
      spicyLevel: [0],
      preparationTime: [15],
      nutritionalInfo: this.fb.group({
        calories: [null],
        protein: [null],
        carbs: [null],
        fat: [null],
        fiber: [null]
      }),
      allergens: [[]],
      isAvailable: [true],
      isFeatured: [false],
      displayOrder: [0]
    });
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

  loadMenuItem(id: string): void {
    this.loading = true;
    this.menuService.getMenuItem(id).subscribe({
      next: (menuItem) => {
        this.menuItem = menuItem;
        this.patchFormValues(menuItem);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load menu item', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/admin/menu-items']);
      }
    });
  }

  patchFormValues(menuItem: MenuItem): void {
    // Patch basic fields
    this.menuItemForm.patchValue({
      name: menuItem.name,
      description: menuItem.description || '',
      category: typeof menuItem.category === 'string' ? menuItem.category : menuItem.category._id,
      price: menuItem.price,
      availability: menuItem.availability || {
        dineIn: true,
        takeaway: true,
        delivery: true,
        roomService: true
      },
      isVegetarian: menuItem.isVegetarian || false,
      isVegan: menuItem.isVegan || false,
      isGlutenFree: menuItem.isGlutenFree || false,
      spicyLevel: menuItem.spicyLevel || 0,
      preparationTime: menuItem.preparationTime || 15,
      nutritionalInfo: menuItem.nutritionalInfo || {
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        fiber: null
      },
      allergens: menuItem.allergens || [],
      isAvailable: menuItem.isAvailable,
      isFeatured: menuItem.isFeatured || false,
      displayOrder: menuItem.displayOrder || 0
    });

    // Clear existing arrays
    this.variantsArray.clear();
    this.addonsArray.clear();

    // Add variants
    if (menuItem.variants && menuItem.variants.length > 0) {
      menuItem.variants.forEach(variant => {
        this.addVariant(variant);
      });
    }

    // Add addons
    if (menuItem.addons && menuItem.addons.length > 0) {
      menuItem.addons.forEach(addon => {
        this.addAddon(addon);
      });
    }

    // Set image preview if available
    if (menuItem.images && menuItem.images.length > 0) {
      this.imagePreview = menuItem.images[0];
    }
  }

  // Variants methods
  get variantsArray(): FormArray {
    return this.menuItemForm.get('variants') as FormArray;
  }

  addVariant(variant?: Variant): void {
    this.variantsArray.push(this.fb.group({
      name: [variant ? variant.name : '', Validators.required],
      price: [variant ? variant.price : 0, [Validators.required, Validators.min(0)]],
      isAvailable: [variant ? variant.isAvailable : true]
    }));
  }

  removeVariant(index: number): void {
    this.variantsArray.removeAt(index);
  }

  // Addons methods
  get addonsArray(): FormArray {
    return this.menuItemForm.get('addons') as FormArray;
  }

  addAddon(addon?: Addon): void {
    const addonGroup = this.fb.group({
      name: [addon ? addon.name : '', Validators.required],
      options: this.fb.array([]),
      required: [addon ? addon.required : false],
      multiple: [addon ? addon.multiple : false],
      min: [addon ? addon.min : null],
      max: [addon ? addon.max : null]
    });

    // Add options if available
    if (addon && addon.options && addon.options.length > 0) {
      const optionsArray = addonGroup.get('options') as FormArray;
      addon.options.forEach(option => {
        optionsArray.push(this.fb.group({
          name: [option.name, Validators.required],
          price: [option.price, [Validators.required, Validators.min(0)]],
          isAvailable: [option.isAvailable]
        }));
      });
    }

    this.addonsArray.push(addonGroup);
  }

  removeAddon(index: number): void {
    this.addonsArray.removeAt(index);
  }

  getAddonOptionsArray(addonIndex: number): FormArray {
    return (this.addonsArray.at(addonIndex) as FormGroup).get('options') as FormArray;
  }

  addAddonOption(addonIndex: number, option?: AddonOption): void {
    const optionsArray = this.getAddonOptionsArray(addonIndex);
    optionsArray.push(this.fb.group({
      name: [option ? option.name : '', Validators.required],
      price: [option ? option.price : 0, [Validators.required, Validators.min(0)]],
      isAvailable: [option ? option.isAvailable : true]
    }));
  }

  removeAddonOption(addonIndex: number, optionIndex: number): void {
    const optionsArray = this.getAddonOptionsArray(addonIndex);
    optionsArray.removeAt(optionIndex);
  }

  // Image handling
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
  }

  // Form submission
  onSubmit(): void {
    if (this.menuItemForm.invalid) {
      this.markFormGroupTouched(this.menuItemForm);
      this.snackBar.open('Please fix the errors in the form', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formData = this.prepareFormData();

    if (this.isEditMode && this.menuItem) {
      this.menuService.updateMenuItem(this.menuItem._id, formData).subscribe({
        next: (updatedItem) => {
          this.snackBar.open('Menu item updated successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          this.router.navigate(['/admin/menu-items']);
        },
        error: (error) => {
          this.snackBar.open('Failed to update menu item', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      this.menuService.createMenuItem(formData).subscribe({
        next: (newItem) => {
          this.snackBar.open('Menu item created successfully', 'Close', { duration: 3000 });
          this.submitting = false;
          this.router.navigate(['/admin/menu-items']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create menu item', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  prepareFormData(): any {
    const formValue = this.menuItemForm.value;

    // Handle image upload (in a real app, you would upload the image to a server/storage)
    // For now, we'll just pass the existing image URL if available
    const images = [];
    if (this.menuItem && this.menuItem.images && this.menuItem.images.length > 0 && !this.imageFile) {
      images.push(this.menuItem.images[0]);
    } else if (this.imageFile) {
      // In a real app, you would upload the image and get the URL
      // For now, we'll just use a placeholder
      images.push('https://example.com/image.jpg');
    }

    return {
      ...formValue,
      images
    };
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
}

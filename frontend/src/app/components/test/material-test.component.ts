import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-material-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Material Test</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Testing Angular Material components</p>
        <mat-form-field appearance="outline">
          <mat-label>Test Input</mat-label>
          <input matInput placeholder="Type something">
        </mat-form-field>
        <button mat-raised-button color="primary">
          <mat-icon>check</mat-icon> Test Button
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 500px;
      margin: 20px auto;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 20px;
    }
  `]
})
export class MaterialTestComponent { }

import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Test Component</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>This is a test component to verify Angular Material is working.</p>
        <mat-form-field appearance="outline">
          <mat-label>Test Input</mat-label>
          <input matInput placeholder="Type something">
        </mat-form-field>
        <button mat-raised-button color="primary">Test Button</button>
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
export class TestComponent { }

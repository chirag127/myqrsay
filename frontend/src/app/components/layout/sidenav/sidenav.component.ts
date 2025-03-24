import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Input() isLoggedIn = false;
  @Input() isAdmin = false;
  @Output() closeSidenav = new EventEmitter<void>();

  onClose(): void {
    this.closeSidenav.emit();
  }
}

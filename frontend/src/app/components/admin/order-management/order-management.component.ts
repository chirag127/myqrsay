import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { SocketService } from '../../../services/socket.service';
import { Order } from '../../../models/order.model';
import { OrderDetailComponent } from '../../order/order-detail/order-detail.component';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  dataSource = new MatTableDataSource<Order>([]);
  displayedColumns: string[] = ['orderNumber', 'date', 'customer', 'type', 'status', 'total', 'actions'];
  loading = true;
  error = '';

  statusFilter = new FormControl('');
  orderTypeFilter = new FormControl('');
  dateFilter = new FormControl('');

  statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  orderTypes = [
    { value: 'dine-in', label: 'Dine-in' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'room-service', label: 'Room Service' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.setupFilters();
    this.setupSocketListeners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getRestaurantOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.dataSource.data = this.filteredOrders;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  setupFilters(): void {
    // Status filter
    this.statusFilter.valueChanges.subscribe(value => {
      this.applyFilters();
    });

    // Order type filter
    this.orderTypeFilter.valueChanges.subscribe(value => {
      this.applyFilters();
    });

    // Date filter
    this.dateFilter.valueChanges.subscribe(value => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply status filter
    const statusValue = this.statusFilter.value;
    if (statusValue) {
      filtered = filtered.filter(order => order.status === statusValue);
    }

    // Apply order type filter
    const orderTypeValue = this.orderTypeFilter.value;
    if (orderTypeValue) {
      filtered = filtered.filter(order => order.orderType === orderTypeValue);
    }

    // Apply date filter
    const dateValue = this.dateFilter.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      selectedDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= selectedDate && orderDate < nextDay;
      });
    }

    this.filteredOrders = filtered;
    this.dataSource.data = this.filteredOrders;
  }

  clearFilters(): void {
    this.statusFilter.setValue('');
    this.orderTypeFilter.setValue('');
    this.dateFilter.setValue('');
    this.filteredOrders = [...this.orders];
    this.dataSource.data = this.filteredOrders;
  }

  setupSocketListeners(): void {
    // Connect to socket
    this.socketService.connect();

    // Listen for new orders
    this.socketService.onNewOrder().subscribe(newOrder => {
      this.orders.unshift(newOrder);
      this.applyFilters();
      this.snackBar.open('New order received!', 'View', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.openOrderDetail(newOrder);
      });
    });

    // Listen for order status updates
    this.socketService.onOrderStatusUpdate().subscribe(update => {
      const index = this.orders.findIndex(o => o._id === update.orderId);
      if (index !== -1) {
        this.orders[index].status = update.status;
        this.orders[index].statusHistory = update.statusHistory;
        this.applyFilters();
      }
    });

    // Listen for order cancellations
    this.socketService.onOrderCancelled().subscribe(cancellation => {
      const index = this.orders.findIndex(o => o._id === cancellation.orderId);
      if (index !== -1) {
        this.orders[index].status = 'cancelled';
        this.orders[index].cancellationReason = cancellation.reason;
        this.applyFilters();
        this.snackBar.open(`Order #${this.orders[index].orderNumber} has been cancelled`, 'Close', {
          duration: 5000
        });
      }
    });
  }

  openOrderDetail(order: Order): void {
    this.dialog.open(OrderDetailComponent, {
      width: '800px',
      data: { orderId: order._id, isAdmin: true }
    });
  }

  updateOrderStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order._id, status).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.applyFilters();
        }
        this.snackBar.open(`Order status updated to ${status}`, 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to update order status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  printOrder(order: Order): void {
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              .order-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              .total-row { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Order #${order.orderNumber}</h1>
            <div class="order-info">
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Type:</strong> ${order.orderType}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              ${order.customer ? `<p><strong>Customer:</strong> ${typeof order.customer === 'string' ? order.customer : order.customer.name}</p>` : ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name} ${item.variant ? `(${item.variant.name})` : ''}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${item.subtotal.toFixed(2)}</td>
                  </tr>
                  ${item.addons && item.addons.length > 0 ? item.addons.map(addon => `
                    <tr>
                      <td>&nbsp;&nbsp;+ ${addon.option.name}</td>
                      <td></td>
                      <td>$${addon.option.price.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  `).join('') : ''}
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Subtotal</td>
                  <td>$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3">Tax</td>
                  <td>$${order.tax.toFixed(2)}</td>
                </tr>
                ${order.discount > 0 ? `
                  <tr>
                    <td colspan="3">Discount</td>
                    <td>-$${order.discount.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${order.deliveryFee > 0 ? `
                  <tr>
                    <td colspan="3">Delivery Fee</td>
                    <td>$${order.deliveryFee.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3">Total</td>
                  <td>$${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  printKOT(order: Order): void {
    // Open print dialog for Kitchen Order Ticket
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>KOT #${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              .order-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <h1>KITCHEN ORDER TICKET</h1>
            <div class="order-info">
              <p><strong>Order #:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Type:</strong> ${order.orderType}</p>
              ${order.orderType === 'dine-in' && order.orderDetails?.dineIn ?
                `<p><strong>Table:</strong> ${order.orderDetails.dineIn.tableNumber}</p>` : ''}
              ${order.orderType === 'takeaway' && order.orderDetails?.takeaway ?
                `<p><strong>Pickup Time:</strong> ${new Date(order.orderDetails.takeaway.pickupTime).toLocaleTimeString()}</p>` : ''}
              ${order.orderType === 'room-service' && order.orderDetails?.roomService ?
                `<p><strong>Room:</strong> ${order.orderDetails.roomService.roomNumber}</p>` : ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name} ${item.variant ? `(${item.variant.name})` : ''}</td>
                    <td>${item.quantity}</td>
                    <td>${item.specialInstructions || ''}</td>
                  </tr>
                  ${item.addons && item.addons.length > 0 ? item.addons.map(addon => `
                    <tr>
                      <td>&nbsp;&nbsp;+ ${addon.option.name}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  `).join('') : ''}
                `).join('')}
              </tbody>
            </table>
            ${order.specialInstructions ? `
              <div style="margin-top: 20px;">
                <p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  ngOnDestroy(): void {
    // Disconnect from socket
    this.socketService.disconnect();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../services/order.service';
import { SocketService } from '../../../services/socket.service';
import { Order } from '../../../models/order.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kitchen-display',
  templateUrl: './kitchen-display.component.html',
  styleUrls: ['./kitchen-display.component.scss']
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  pendingOrders: Order[] = [];
  preparingOrders: Order[] = [];
  readyOrders: Order[] = [];
  loading = true;
  error = '';

  private socketSubscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.setupSocketListeners();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getRestaurantOrders().subscribe({
      next: (orders) => {
        this.categorizeOrders(orders);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  categorizeOrders(orders: Order[]): void {
    // Reset arrays
    this.pendingOrders = [];
    this.preparingOrders = [];
    this.readyOrders = [];

    // Filter orders by status
    orders.forEach(order => {
      if (order.status === 'pending' || order.status === 'confirmed') {
        this.pendingOrders.push(order);
      } else if (order.status === 'preparing') {
        this.preparingOrders.push(order);
      } else if (order.status === 'ready') {
        this.readyOrders.push(order);
      }
    });

    // Sort by creation date (newest first)
    this.pendingOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.preparingOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.readyOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  setupSocketListeners(): void {
    // Connect to socket
    this.socketService.connect();

    // Listen for new orders
    const newOrderSub = this.socketService.onNewOrder().subscribe(newOrder => {
      if (newOrder.status === 'pending' || newOrder.status === 'confirmed') {
        this.pendingOrders.unshift(newOrder);
      }

      this.snackBar.open('New order received!', 'Close', {
        duration: 5000
      });
    });

    // Listen for order status updates
    const statusUpdateSub = this.socketService.onOrderStatusUpdate().subscribe(update => {
      // Find the order in all arrays
      const pendingIndex = this.pendingOrders.findIndex(o => o._id === update.orderId);
      const preparingIndex = this.preparingOrders.findIndex(o => o._id === update.orderId);
      const readyIndex = this.readyOrders.findIndex(o => o._id === update.orderId);

      let order: Order | null = null;

      // Remove from current array
      if (pendingIndex !== -1) {
        order = this.pendingOrders[pendingIndex];
        this.pendingOrders.splice(pendingIndex, 1);
      } else if (preparingIndex !== -1) {
        order = this.preparingOrders[preparingIndex];
        this.preparingOrders.splice(preparingIndex, 1);
      } else if (readyIndex !== -1) {
        order = this.readyOrders[readyIndex];
        this.readyOrders.splice(readyIndex, 1);
      }

      // Update order status and add to appropriate array
      if (order) {
        order.status = update.status;
        order.statusHistory = update.statusHistory;

        if (update.status === 'pending' || update.status === 'confirmed') {
          this.pendingOrders.unshift(order);
        } else if (update.status === 'preparing') {
          this.preparingOrders.unshift(order);
        } else if (update.status === 'ready') {
          this.readyOrders.unshift(order);
        }
      }
    });

    // Listen for order cancellations
    const cancelSub = this.socketService.onOrderCancelled().subscribe(cancellation => {
      // Find the order in all arrays
      const pendingIndex = this.pendingOrders.findIndex(o => o._id === cancellation.orderId);
      const preparingIndex = this.preparingOrders.findIndex(o => o._id === cancellation.orderId);
      const readyIndex = this.readyOrders.findIndex(o => o._id === cancellation.orderId);

      // Remove from current array
      if (pendingIndex !== -1) {
        this.pendingOrders.splice(pendingIndex, 1);
      } else if (preparingIndex !== -1) {
        this.preparingOrders.splice(preparingIndex, 1);
      } else if (readyIndex !== -1) {
        this.readyOrders.splice(readyIndex, 1);
      }

      this.snackBar.open(`Order has been cancelled: ${cancellation.reason}`, 'Close', {
        duration: 5000
      });
    });

    this.socketSubscriptions.push(newOrderSub, statusUpdateSub, cancelSub);
  }

  updateOrderStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order._id, status).subscribe({
      next: (updatedOrder) => {
        // Find the order in all arrays
        const pendingIndex = this.pendingOrders.findIndex(o => o._id === updatedOrder._id);
        const preparingIndex = this.preparingOrders.findIndex(o => o._id === updatedOrder._id);
        const readyIndex = this.readyOrders.findIndex(o => o._id === updatedOrder._id);

        // Remove from current array
        if (pendingIndex !== -1) {
          this.pendingOrders.splice(pendingIndex, 1);
        } else if (preparingIndex !== -1) {
          this.preparingOrders.splice(preparingIndex, 1);
        } else if (readyIndex !== -1) {
          this.readyOrders.splice(readyIndex, 1);
        }

        // Add to appropriate array
        if (status === 'pending' || status === 'confirmed') {
          this.pendingOrders.unshift(updatedOrder);
        } else if (status === 'preparing') {
          this.preparingOrders.unshift(updatedOrder);
        } else if (status === 'ready') {
          this.readyOrders.unshift(updatedOrder);
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
    // Unsubscribe from all socket subscriptions
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());

    // Disconnect from socket
    this.socketService.disconnect();
  }
}

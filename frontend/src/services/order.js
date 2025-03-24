import api from './api';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders.'
    };
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch order details.'
    };
  }
};

export const getOrdersByStatus = async (status) => {
  try {
    const response = await api.get(`/orders/status/${status}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders by status.'
    };
  }
};

export const getOrdersByUser = async (userId) => {
  try {
    const response = await api.get(`/orders/user/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user orders.'
    };
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order.'
    };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order status.'
    };
  }
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const response = await api.patch(`/orders/${id}/payment`, { paymentStatus });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update payment status.'
    };
  }
};

export const cancelOrder = async (id, reason) => {
  try {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to cancel order.'
    };
  }
};

export const generateBillHTML = (order) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .restaurant-name {
            font-size: 24px;
            font-weight: bold;
          }
          .bill-title {
            font-size: 18px;
            margin: 10px 0;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .order-info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total-section {
            margin-top: 20px;
          }
          .total-row {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">Restaurant Name</div>
          <div class="bill-title">BILL</div>
        </div>

        <div class="order-info">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Order Type:</strong> ${order.orderType}</p>
          ${order.tableNumber ? `<p><strong>Table #:</strong> ${order.tableNumber}</p>` : ''}
          ${order.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>Add-ons</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.dish.name}</td>
                <td>${item.variant.name}</td>
                <td>${item.addons.map(addon =>
                  `${addon.name}: ${addon.options.map(opt => opt.name).join(', ')}`
                ).join('<br>')}</td>
                <td>${item.quantity}</td>
                <td>$${item.variant.price.toFixed(2)}</td>
                <td>$${item.itemTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
          ${order.discount > 0 ? `<p><strong>Discount:</strong> $${order.discount.toFixed(2)}</p>` : ''}
          <p class="total-row"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
        </div>
      </body>
    </html>
  `;
};

export const generateKOTHTML = (order) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .kot-title {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .order-info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .special-instructions {
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="kot-title">KITCHEN ORDER TICKET (KOT)</div>
        </div>

        <div class="order-info">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Order Type:</strong> ${order.orderType}</p>
          ${order.tableNumber ? `<p><strong>Table #:</strong> ${order.tableNumber}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>Add-ons</th>
              <th>Qty</th>
              <th>Special Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.dish.name}</td>
                <td>${item.variant.name}</td>
                <td>${item.addons.map(addon =>
                  `${addon.name}: ${addon.options.map(opt => opt.name).join(', ')}`
                ).join('<br>')}</td>
                <td>${item.quantity}</td>
                <td class="special-instructions">${item.specialInstructions || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

export const printBill = async (order) => {
  try {
    const html = generateBillHTML(order);
    const { uri } = await Print.printToFileAsync({ html });

    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to print bill.'
    };
  }
};

export const printKOT = async (order) => {
  try {
    const html = generateKOTHTML(order);
    const { uri } = await Print.printToFileAsync({ html });

    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to print KOT.'
    };
  }
};

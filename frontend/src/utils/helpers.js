// Format currency
export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date and time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get order status color
export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#f39c12'; // Orange
    case 'confirmed':
      return '#3498db'; // Blue
    case 'preparing':
      return '#9b59b6'; // Purple
    case 'ready':
      return '#2ecc71'; // Green
    case 'delivered':
      return '#27ae60'; // Dark Green
    case 'completed':
      return '#2ecc71'; // Green
    case 'cancelled':
      return '#e74c3c'; // Red
    default:
      return '#7f8c8d'; // Gray
  }
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#f39c12'; // Orange
    case 'completed':
      return '#2ecc71'; // Green
    case 'failed':
      return '#e74c3c'; // Red
    default:
      return '#7f8c8d'; // Gray
  }
};

// Validate email
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Validate phone number
export const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(String(phone));
};

// Generate order number
export const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// Calculate time slots for pickup/delivery
export const generateTimeSlots = (startHour = 10, endHour = 22, intervalMinutes = 30) => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Start from current hour if within range
  const todayStartHour = Math.max(startHour, currentHour);

  // Generate slots for today
  for (let hour = todayStartHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      // Skip past times
      if (hour === currentHour && minute <= currentMinute) {
        continue;
      }

      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const date = new Date();
      date.setHours(hour, minute, 0, 0);

      slots.push({
        label: timeString,
        value: date,
      });
    }
  }

  // Generate slots for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `Tomorrow ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const date = new Date(tomorrow);
      date.setHours(hour, minute, 0, 0);

      slots.push({
        label: timeString,
        value: date,
      });
    }
  }

  return slots;
};

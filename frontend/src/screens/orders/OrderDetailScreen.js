import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Button, Divider, Chip, Portal, Dialog, Paragraph, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as orderService from '../../services/order';
import { formatCurrency, formatDateTime, getOrderStatusColor, getPaymentStatusColor } from '../../utils/helpers';
import { subscribeToEvent, unsubscribeFromEvent, emitEvent } from '../../services/socket';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load order details
  useEffect(() => {
    loadOrderDetails();

    // Subscribe to order updates
    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
      }
    };

    subscribeToEvent('orderUpdate', handleOrderUpdate);

    return () => {
      unsubscribeFromEvent('orderUpdate', handleOrderUpdate);
    };
  }, [orderId]);

  // Load order details
  const loadOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await orderService.getOrderById(orderId);

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setSnackbarMessage('Please provide a reason for cancellation');
      setSnackbarVisible(true);
      return;
    }

    setCancelLoading(true);

    try {
      const result = await orderService.cancelOrder(orderId, cancelReason);

      if (result.success) {
        setOrder(result.data);
        setSnackbarMessage('Order cancelled successfully');
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage(result.error || 'Failed to cancel order');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to cancel order. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setCancelLoading(false);
      setCancelDialogVisible(false);
      setCancelReason('');
    }
  };

  // Handle update order status (for admin/staff)
  const handleUpdateStatus = async (status) => {
    setStatusUpdateLoading(true);

    try {
      const result = await orderService.updateOrderStatus(orderId, status);

      if (result.success) {
        setOrder(result.data);

        // Emit order update event
        emitEvent('orderUpdate', result.data);

        setSnackbarMessage(`Order status updated to ${status}`);
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage(result.error || 'Failed to update order status');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to update order status. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle print bill
  const handlePrintBill = async () => {
    if (!order) return;

    try {
      const result = await orderService.printBill(order);

      if (!result.success) {
        setSnackbarMessage(result.error || 'Failed to print bill');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to print bill. Please try again.');
      setSnackbarVisible(true);
    }
  };

  // Handle print KOT (for admin/staff)
  const handlePrintKOT = async () => {
    if (!order) return;

    try {
      const result = await orderService.printKOT(order);

      if (!result.success) {
        setSnackbarMessage(result.error || 'Failed to print KOT');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to print KOT. Please try again.');
      setSnackbarVisible(true);
    }
  };

  // Open maps for delivery address
  const openMaps = () => {
    if (!order?.deliveryAddress?.coordinates) return;

    const { lat, lng } = order.deliveryAddress.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      setSnackbarMessage('Could not open maps');
      setSnackbarVisible(true);
    });
  };

  // Render status actions for admin/staff
  const renderStatusActions = () => {
    if (!order || !(user.role === 'admin' || user.role === 'staff')) return null;

    const currentStatus = order.orderStatus;
    let nextStatuses = [];

    switch (currentStatus) {
      case 'pending':
        nextStatuses = ['confirmed', 'cancelled'];
        break;
      case 'confirmed':
        nextStatuses = ['preparing', 'cancelled'];
        break;
      case 'preparing':
        nextStatuses = ['ready', 'cancelled'];
        break;
      case 'ready':
        nextStatuses = ['delivered', 'completed', 'cancelled'];
        break;
      case 'delivered':
        nextStatuses = ['completed', 'cancelled'];
        break;
      default:
        return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Order Status</Text>

        <View style={styles.statusActions}>
          {nextStatuses.map((status) => (
            <Button
              key={status}
              mode={status === 'cancelled' ? 'outlined' : 'contained'}
              onPress={() => handleUpdateStatus(status)}
              style={[
                styles.statusButton,
                status === 'cancelled' && styles.cancelButton
              ]}
              disabled={statusUpdateLoading}
              loading={statusUpdateLoading}
              color={status === 'cancelled' ? '#e74c3c' : undefined}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </View>

        {(currentStatus === 'confirmed' || currentStatus === 'preparing') && (
          <Button
            mode="outlined"
            onPress={handlePrintKOT}
            style={styles.printButton}
            icon="printer"
          >
            Print KOT
          </Button>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingIndicator fullScreen text="Loading order details..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage error={error} />
        <Button
          mode="contained"
          onPress={loadOrderDetails}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Order Header */}
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
          </View>

          <Chip
            style={[styles.statusChip, { backgroundColor: getOrderStatusColor(order.orderStatus) }]}
            textStyle={styles.statusChipText}
          >
            {order.orderStatus.toUpperCase()}
          </Chip>
        </View>

        {/* Order Type Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Type:</Text>
            <Text style={styles.detailValue}>{order.orderType}</Text>
          </View>

          {order.orderType === 'dine-in' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Table Number:</Text>
              <Text style={styles.detailValue}>{order.tableNumber}</Text>
            </View>
          )}

          {order.orderType === 'takeaway' && order.pickupTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Time:</Text>
              <Text style={styles.detailValue}>{formatDateTime(order.pickupTime)}</Text>
            </View>
          )}

          {order.orderType === 'room-service' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Room Number:</Text>
              <Text style={styles.detailValue}>{order.roomNumber}</Text>
            </View>
          )}

          {order.orderType === 'delivery' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivery Address:</Text>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText}>
                    {order.deliveryAddress.addressLine1}
                    {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                  </Text>
                  <Text style={styles.addressText}>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                  </Text>

                  {order.deliveryAddress.coordinates && (
                    <TouchableOpacity onPress={openMaps} style={styles.mapLink}>
                      <Ionicons name="map" size={16} color="#ff6b00" />
                      <Text style={styles.mapLinkText}>View on Map</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {order.deliveryTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Time:</Text>
                  <Text style={styles.detailValue}>{formatDateTime(order.deliveryTime)}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Chip
              style={[styles.paymentStatusChip, { backgroundColor: getPaymentStatusColor(order.paymentStatus) }]}
              textStyle={styles.statusChipText}
            >
              {order.paymentStatus.toUpperCase()}
            </Chip>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{order.customer.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customer.phone}`)}>
              <Text style={[styles.detailValue, styles.phoneLink]}>{order.customer.phone}</Text>
            </TouchableOpacity>
          </View>

          {order.customer.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${order.customer.email}`)}>
                <Text style={[styles.detailValue, styles.emailLink]}>{order.customer.email}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>

          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.dish.name}</Text>
                  <Text style={styles.itemVariant}>{item.variant.name}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.itemTotal)}</Text>
              </View>

              {item.addons.length > 0 && (
                <View style={styles.addonsContainer}>
                  {item.addons.map((addon, addonIndex) => (
                    <Text key={addonIndex} style={styles.addonText}>
                      {addon.name}: {addon.options.map(opt => opt.name).join(', ')}
                    </Text>
                  ))}
                </View>
              )}

              {item.specialInstructions && (
                <Text style={styles.specialInstructions}>
                  Note: {item.specialInstructions}
                </Text>
              )}

              {index < order.items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
          </View>

          {order.discount > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{formatCurrency(order.discount)}</Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Status Actions for Admin/Staff */}
        {renderStatusActions()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {order.orderStatus === 'pending' && (
          <Button
            mode="outlined"
            onPress={() => setCancelDialogVisible(true)}
            style={styles.cancelOrderButton}
            icon="close"
            color="#e74c3c"
          >
            Cancel Order
          </Button>
        )}

        <Button
          mode="contained"
          onPress={handlePrintBill}
          style={styles.printBillButton}
          icon="printer"
        >
          Print Bill
        </Button>
      </View>

      {/* Cancel Order Dialog */}
      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>Cancel Order</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to cancel this order? Please provide a reason:
            </Paragraph>
            <TextInput
              mode="outlined"
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Reason for cancellation"
              multiline
              numberOfLines={3}
              style={styles.cancelReasonInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>No, Keep Order</Button>
            <Button
              onPress={handleCancelOrder}
              loading={cancelLoading}
              disabled={cancelLoading || !cancelReason.trim()}
              color="#e74c3c"
            >
              Yes, Cancel Order
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
  },
  addressContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mapLinkText: {
    color: '#ff6b00',
    marginLeft: 4,
    fontSize: 14,
  },
  phoneLink: {
    color: '#2196f3',
  },
  emailLink: {
    color: '#2196f3',
  },
  paymentStatusChip: {
    height: 24,
  },
  orderItem: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    width: 30,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemVariant: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addonsContainer: {
    marginLeft: 38,
    marginTop: 4,
  },
  addonText: {
    fontSize: 14,
    color: '#666',
  },
  specialInstructions: {
    marginLeft: 38,
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  itemDivider: {
    marginTop: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
  },
  discountValue: {
    fontSize: 16,
    color: '#4caf50',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b00',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelOrderButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#e74c3c',
  },
  printBillButton: {
    flex: 1,
    marginLeft: 8,
  },
  cancelReasonInput: {
    marginTop: 16,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#e74c3c',
  },
  printButton: {
    marginTop: 8,
  },
  retryButton: {
    margin: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
});

export default OrderDetailScreen;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, RadioButton, TextInput, Divider, Snackbar, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import * as orderService from '../../services/order';
import * as Location from 'expo-location';
import { formatCurrency, generateTimeSlots, generateOrderNumber } from '../../utils/helpers';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { cart, clearCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();

  const [orderType, setOrderType] = useState(cart.orderType || 'dine-in');
  const [tableNumber, setTableNumber] = useState(cart.tableNumber || '');
  const [roomNumber, setRoomNumber] = useState(cart.roomNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState(cart.deliveryAddress || null);
  const [pickupTime, setPickupTime] = useState(cart.pickupTime || null);
  const [deliveryTime, setDeliveryTime] = useState(cart.deliveryTime || null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Generate time slots for pickup/delivery
  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
  }, []);

  // Validate form based on order type
  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (orderType === 'dine-in' && !tableNumber) {
      newErrors.tableNumber = 'Table number is required';
    }

    if (orderType === 'room-service' && !roomNumber) {
      newErrors.roomNumber = 'Room number is required';
    }

    if (orderType === 'takeaway' && !selectedTimeSlot) {
      newErrors.pickupTime = 'Pickup time is required';
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress) {
        newErrors.deliveryAddress = 'Delivery address is required';
      }

      if (!selectedTimeSlot) {
        newErrors.deliveryTime = 'Delivery time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get current location for delivery
  const getCurrentLocation = async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setSnackbarMessage('Permission to access location was denied');
        setSnackbarVisible(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (address) {
        const formattedAddress = {
          addressLine1: address.street || 'Unknown Street',
          addressLine2: address.name || '',
          city: address.city || 'Unknown City',
          state: address.region || 'Unknown State',
          postalCode: address.postalCode || 'Unknown Postal Code',
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        };

        setDeliveryAddress(formattedAddress);
      }
    } catch (error) {
      setSnackbarMessage('Failed to get current location');
      setSnackbarVisible(true);
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create order object
      const orderData = {
        orderNumber: generateOrderNumber(),
        orderType,
        orderStatus: 'pending',
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        discount: cart.discount,
        total: cart.total,
        promoCode: cart.promoCode,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          name,
          phone,
          email
        },
        specialInstructions
      };

      // Add order type specific data
      if (orderType === 'dine-in') {
        orderData.tableNumber = tableNumber;
      } else if (orderType === 'takeaway') {
        orderData.pickupTime = selectedTimeSlot;
      } else if (orderType === 'delivery') {
        orderData.deliveryAddress = deliveryAddress;
        orderData.deliveryTime = selectedTimeSlot;
      } else if (orderType === 'room-service') {
        orderData.roomNumber = roomNumber;
      }

      // Create order
      const result = await orderService.createOrder(orderData);

      if (result.success) {
        setCreatedOrder(result.data);
        setSuccessDialogVisible(true);
        await clearCart();
      } else {
        setSnackbarMessage(result.error || 'Failed to place order');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to place order. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle view order
  const handleViewOrder = () => {
    setSuccessDialogVisible(false);
    navigation.navigate('OrdersTab', {
      screen: 'OrderDetail',
      params: { orderId: createdOrder.id }
    });
  };

  // Render time slot picker
  const renderTimeSlotPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {orderType === 'takeaway' ? 'Pickup Time' : 'Delivery Time'}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotContainer}>
        {timeSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeSlot,
              selectedTimeSlot === slot.value && styles.selectedTimeSlot
            ]}
            onPress={() => setSelectedTimeSlot(slot.value)}
          >
            <Text style={[
              styles.timeSlotText,
              selectedTimeSlot === slot.value && styles.selectedTimeSlotText
            ]}>
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {errors.pickupTime && <Text style={styles.errorText}>{errors.pickupTime}</Text>}
      {errors.deliveryTime && <Text style={styles.errorText}>{errors.deliveryTime}</Text>}
    </View>
  );

  // Render delivery address section
  const renderDeliveryAddressSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>

      {deliveryAddress ? (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            {deliveryAddress.addressLine1}
            {deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}
          </Text>
          <Text style={styles.addressText}>
            {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postalCode}
          </Text>

          <Button
            mode="outlined"
            onPress={() => setDeliveryAddress(null)}
            style={styles.addressButton}
          >
            Change Address
          </Button>
        </View>
      ) : (
        <View>
          <Button
            mode="contained"
            onPress={getCurrentLocation}
            style={styles.addressButton}
            loading={locationLoading}
            disabled={locationLoading}
          >
            Use Current Location
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ProfileTab', {
              screen: 'Addresses',
              params: { selectMode: true }
            })}
            style={[styles.addressButton, { marginTop: 8 }]}
          >
            Select Saved Address
          </Button>
        </View>
      )}

      {errors.deliveryAddress && <Text style={styles.errorText}>{errors.deliveryAddress}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Order Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>

          <RadioButton.Group onValueChange={value => setOrderType(value)} value={orderType}>
            <View style={styles.radioItem}>
              <RadioButton value="dine-in" />
              <Text style={styles.radioLabel}>Dine-in</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="takeaway" />
              <Text style={styles.radioLabel}>Takeaway</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="delivery" />
              <Text style={styles.radioLabel}>Delivery</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="room-service" />
              <Text style={styles.radioLabel}>Room Service</Text>
            </View>
          </RadioButton.Group>
        </View>

        {/* Order Type Specific Fields */}
        {orderType === 'dine-in' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Table Number</Text>
            <TextInput
              mode="outlined"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="number-pad"
              style={styles.input}
              error={!!errors.tableNumber}
            />
            {errors.tableNumber && <Text style={styles.errorText}>{errors.tableNumber}</Text>}
          </View>
        )}

        {orderType === 'room-service' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Number</Text>
            <TextInput
              mode="outlined"
              value={roomNumber}
              onChangeText={setRoomNumber}
              keyboardType="number-pad"
              style={styles.input}
              error={!!errors.roomNumber}
            />
            {errors.roomNumber && <Text style={styles.errorText}>{errors.roomNumber}</Text>}
          </View>
        )}

        {orderType === 'takeaway' && renderTimeSlotPicker()}

        {orderType === 'delivery' && (
          <>
            {renderDeliveryAddressSection()}
            {renderTimeSlotPicker()}
          </>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <TextInput
            mode="outlined"
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            error={!!errors.name}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            mode="outlined"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.phone}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <TextInput
            mode="outlined"
            label="Email (Optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
            <View style={styles.radioItem}>
              <RadioButton value="cash" />
              <Text style={styles.radioLabel}>Cash on Delivery</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="card" />
              <Text style={styles.radioLabel}>Credit/Debit Card</Text>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="wallet" />
              <Text style={styles.radioLabel}>Digital Wallet</Text>
            </View>
          </RadioButton.Group>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>

          <TextInput
            mode="outlined"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Items ({cart.items.length})</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cart.subtotal)}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cart.tax)}</Text>
          </View>

          {cart.discount > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{formatCurrency(cart.discount)}</Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(cart.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          disabled={loading || cartLoading}
          loading={loading}
        >
          Place Order
        </Button>
      </View>

      {(loading || cartLoading) && <LoadingIndicator fullScreen text="Processing order..." />}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={successDialogVisible} onDismiss={() => setSuccessDialogVisible(false)}>
          <Dialog.Title>Order Placed Successfully!</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Your order has been placed successfully. You can track your order status in the Orders section.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => navigation.navigate('Menu')}>Back to Menu</Button>
            <Button onPress={handleViewOrder} mode="contained">View Order</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 8,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#ff6b00',
  },
  timeSlotText: {
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addressContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressButton: {
    marginTop: 8,
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
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    height: 50,
    justifyContent: 'center',
  },
});

export default CheckoutScreen;

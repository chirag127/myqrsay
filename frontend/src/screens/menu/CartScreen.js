import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Divider, TextInput, Snackbar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';
import LoadingIndicator from '../../components/common/LoadingIndicator';

const CartScreen = () => {
  const navigation = useNavigation();
  const {
    cart,
    isLoading,
    removeItem,
    updateItemQuantity,
    applyPromoCode,
    removePromoCode
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle apply promo code
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setSnackbarMessage('Please enter a promo code');
      setSnackbarVisible(true);
      return;
    }

    setPromoCodeLoading(true);

    const result = await applyPromoCode(promoCode.trim());

    if (result.success) {
      setSnackbarMessage('Promo code applied successfully!');
    } else {
      setSnackbarMessage(result.error || 'Invalid promo code');
    }

    setSnackbarVisible(true);
    setPromoCodeLoading(false);
  };

  // Handle remove promo code
  const handleRemovePromoCode = async () => {
    await removePromoCode();
    setPromoCode('');
    setSnackbarMessage('Promo code removed');
    setSnackbarVisible(true);
  };

  // Handle remove item
  const handleRemoveItem = async (index) => {
    await removeItem(index);
  };

  // Handle update quantity
  const handleUpdateQuantity = async (index, quantity) => {
    if (quantity < 1) {
      return;
    }

    await updateItemQuantity(index, quantity);
  };

  // Handle checkout
  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  // If cart is empty
  if (cart.items.length === 0) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        message="Add some delicious dishes to your cart!"
        buttonText="Browse Menu"
        onButtonPress={() => navigation.navigate('Menu')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Order</Text>

          {cart.items.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  {item.dish.image && (
                    <Image source={{ uri: item.dish.image }} style={styles.itemImage} />
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.dish.name}</Text>
                    <Text style={styles.itemVariant}>{item.variant.name}</Text>

                    {item.addons.length > 0 && (
                      <View style={styles.addonsContainer}>
                        {item.addons.map((addon, addonIndex) => (
                          <Text key={addonIndex} style={styles.addonText}>
                            {addon.name}: {addon.options.map(opt => opt.name).join(', ')}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleRemoveItem(index)}
                  style={styles.removeButton}
                />
              </View>

              <View style={styles.itemFooter}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(index, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(index, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>{formatCurrency(item.itemTotal)}</Text>
              </View>

              <Divider style={styles.divider} />
            </View>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>

          <View style={styles.promoContainer}>
            <TextInput
              mode="outlined"
              label="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              style={styles.promoInput}
              disabled={!!cart.promoCode || promoCodeLoading}
            />

            {cart.promoCode ? (
              <Button
                mode="contained"
                onPress={handleRemovePromoCode}
                style={styles.promoButton}
                disabled={isLoading}
              >
                Remove
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleApplyPromoCode}
                style={styles.promoButton}
                loading={promoCodeLoading}
                disabled={isLoading || promoCodeLoading || !promoCode.trim()}
              >
                Apply
              </Button>
            )}
          </View>

          {cart.promoCode && (
            <Text style={styles.appliedPromoText}>
              Promo code "{cart.promoCode}" applied
            </Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
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
          onPress={handleCheckout}
          style={styles.checkoutButton}
          disabled={isLoading}
        >
          Proceed to Checkout
        </Button>
      </View>

      {isLoading && <LoadingIndicator fullScreen text="Updating cart..." />}

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
  cartItem: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemVariant: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addonsContainer: {
    marginTop: 4,
  },
  addonText: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    margin: 0,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginTop: 16,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    marginRight: 12,
  },
  promoButton: {
    height: 50,
    justifyContent: 'center',
  },
  appliedPromoText: {
    marginTop: 8,
    color: '#4caf50',
    fontStyle: 'italic',
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
  checkoutButton: {
    height: 50,
    justifyContent: 'center',
  },
});

export default CartScreen;

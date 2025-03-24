import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, RadioButton, Checkbox, Chip, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';

const DishDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dish } = route.params;
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(
    dish.variants.find(v => v.isDefault) || dish.variants[0]
  );
  const [selectedAddons, setSelectedAddons] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = selectedVariant.price;

    // Add addon prices
    Object.entries(selectedAddons).forEach(([addonId, options]) => {
      const addon = dish.addons.find(a => a.id === addonId);
      if (addon) {
        options.forEach(optionId => {
          const option = addon.options.find(o => o.id === optionId);
          if (option) {
            total += option.price;
          }
        });
      }
    });

    return total * quantity;
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  // Handle addon option selection
  const handleAddonOptionSelect = (addon, option) => {
    const addonId = addon.id;
    const optionId = option.id;

    setSelectedAddons(prev => {
      const newSelectedAddons = { ...prev };

      if (!newSelectedAddons[addonId]) {
        newSelectedAddons[addonId] = [];
      }

      if (addon.multiSelect) {
        // For multi-select addons, toggle the option
        if (newSelectedAddons[addonId].includes(optionId)) {
          newSelectedAddons[addonId] = newSelectedAddons[addonId].filter(id => id !== optionId);
        } else {
          newSelectedAddons[addonId] = [...newSelectedAddons[addonId], optionId];
        }
      } else {
        // For single-select addons, replace the selection
        newSelectedAddons[addonId] = [optionId];
      }

      return newSelectedAddons;
    });
  };

  // Check if addon option is selected
  const isAddonOptionSelected = (addon, option) => {
    const addonId = addon.id;
    const optionId = option.id;

    return selectedAddons[addonId]?.includes(optionId) || false;
  };

  // Increment quantity
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    // Check if required addons are selected
    const missingRequiredAddons = dish.addons
      .filter(addon => addon.required)
      .filter(addon => !selectedAddons[addon.id] || selectedAddons[addon.id].length === 0)
      .map(addon => addon.name);

    if (missingRequiredAddons.length > 0) {
      setSnackbarMessage(`Please select options for: ${missingRequiredAddons.join(', ')}`);
      setSnackbarVisible(true);
      return;
    }

    // Prepare addons for cart
    const cartAddons = dish.addons
      .filter(addon => selectedAddons[addon.id] && selectedAddons[addon.id].length > 0)
      .map(addon => ({
        name: addon.name,
        options: addon.options
          .filter(option => selectedAddons[addon.id]?.includes(option.id))
          .map(option => ({
            name: option.name,
            price: option.price,
          })),
      }));

    // Create cart item
    const cartItem = {
      dish: {
        id: dish.id,
        name: dish.name,
        image: dish.image,
      },
      variant: {
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: selectedVariant.price,
      },
      addons: cartAddons,
      quantity,
      specialInstructions,
      itemTotal: calculateTotalPrice(),
    };

    // Add to cart
    const result = await addToCart(cartItem);

    if (result.success) {
      setSnackbarMessage('Added to cart!');
      setSnackbarVisible(true);
    } else {
      setSnackbarMessage(result.error || 'Failed to add to cart');
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {dish.image && (
          <Image source={{ uri: dish.image }} style={styles.image} />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{dish.name}</Text>
          <Text style={styles.description}>{dish.description}</Text>

          {/* Variants */}
          {dish.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size / Variant</Text>
              <RadioButton.Group
                onValueChange={value => {
                  const variant = dish.variants.find(v => v.id === value);
                  if (variant) {
                    handleVariantSelect(variant);
                  }
                }}
                value={selectedVariant.id}
              >
                {dish.variants.map(variant => (
                  <TouchableOpacity
                    key={variant.id}
                    style={styles.variantItem}
                    onPress={() => handleVariantSelect(variant)}
                  >
                    <View style={styles.variantInfo}>
                      <RadioButton value={variant.id} />
                      <Text style={styles.variantName}>{variant.name}</Text>
                    </View>
                    <Text style={styles.variantPrice}>{formatCurrency(variant.price)}</Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </View>
          )}

          {/* Addons */}
          {dish.addons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customize Your Order</Text>

              {dish.addons.map(addon => (
                <View key={addon.id} style={styles.addonContainer}>
                  <View style={styles.addonHeader}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    {addon.required && (
                      <Chip style={styles.requiredChip}>Required</Chip>
                    )}
                    <Text style={styles.addonType}>
                      {addon.multiSelect ? 'Select Multiple' : 'Select One'}
                    </Text>
                  </View>

                  {addon.options.map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionItem}
                      onPress={() => handleAddonOptionSelect(addon, option)}
                    >
                      <View style={styles.optionInfo}>
                        {addon.multiSelect ? (
                          <Checkbox
                            status={isAddonOptionSelected(addon, option) ? 'checked' : 'unchecked'}
                          />
                        ) : (
                          <RadioButton
                            value={option.id}
                            status={isAddonOptionSelected(addon, option) ? 'checked' : 'unchecked'}
                          />
                        )}
                        <Text style={styles.optionName}>{option.name}</Text>
                      </View>
                      {option.price > 0 && (
                        <Text style={styles.optionPrice}>+{formatCurrency(option.price)}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.price}>{formatCurrency(calculateTotalPrice())}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={styles.addButton}
          disabled={!dish.isAvailable}
        >
          {dish.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  variantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variantName: {
    fontSize: 16,
    marginLeft: 8,
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addonContainer: {
    marginBottom: 16,
  },
  addonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addonName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  requiredChip: {
    backgroundColor: '#ffebee',
    marginRight: 8,
  },
  addonType: {
    fontSize: 14,
    color: '#666',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 16,
    marginLeft: 8,
  },
  optionPrice: {
    fontSize: 16,
    color: '#ff6b00',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flex: 1,
    marginLeft: 16,
  },
});

export default DishDetailScreen;

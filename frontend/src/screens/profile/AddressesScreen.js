import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Card, IconButton, FAB, Portal, Dialog, Paragraph, TextInput, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import * as Location from 'expo-location';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const AddressesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { setDeliveryAddress } = useCart();

  // Check if we're in select mode (for checkout)
  const selectMode = route.params?.selectMode || false;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    id: null,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    isDefault: false,
    coordinates: null
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load addresses
  useEffect(() => {
    // In a real app, you would fetch addresses from your API
    // For now, we'll use mock data
    const mockAddresses = [
      {
        id: '1',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        landmark: 'Near Central Park',
        isDefault: true,
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      },
      {
        id: '2',
        addressLine1: '456 Elm Avenue',
        addressLine2: '',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        landmark: 'Next to Shopping Mall',
        isDefault: false,
        coordinates: {
          lat: 34.0522,
          lng: -118.2437
        }
      }
    ];

    setAddresses(mockAddresses);
    setLoading(false);
  }, []);

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setSnackbarMessage('Permission to access location was denied');
        setSnackbarVisible(true);
        setLocationLoading(false);
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
        setCurrentAddress({
          ...currentAddress,
          addressLine1: address.street || '',
          city: address.city || '',
          state: address.region || '',
          postalCode: address.postalCode || '',
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        });

        setDialogVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to get current location');
      setSnackbarVisible(true);
    } finally {
      setLocationLoading(false);
    }
  };

  // Add new address
  const addNewAddress = () => {
    setEditMode(false);
    setCurrentAddress({
      id: null,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      landmark: '',
      isDefault: addresses.length === 0, // Make default if it's the first address
      coordinates: null
    });
    setDialogVisible(true);
  };

  // Edit address
  const editAddress = (address) => {
    setEditMode(true);
    setCurrentAddress(address);
    setDialogVisible(true);
  };

  // Save address
  const saveAddress = () => {
    // Validate address
    if (!currentAddress.addressLine1 || !currentAddress.city || !currentAddress.state || !currentAddress.postalCode) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarVisible(true);
      return;
    }

    if (editMode) {
      // Update existing address
      const updatedAddresses = addresses.map(addr =>
        addr.id === currentAddress.id ? currentAddress : addr
      );

      // If this address is set as default, update other addresses
      if (currentAddress.isDefault) {
        updatedAddresses.forEach(addr => {
          if (addr.id !== currentAddress.id) {
            addr.isDefault = false;
          }
        });
      }

      setAddresses(updatedAddresses);
      setSnackbarMessage('Address updated successfully');
    } else {
      // Add new address
      const newAddress = {
        ...currentAddress,
        id: Date.now().toString() // Generate a unique ID
      };

      // If this address is set as default, update other addresses
      if (newAddress.isDefault) {
        addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }

      setAddresses([...addresses, newAddress]);
      setSnackbarMessage('Address added successfully');
    }

    setDialogVisible(false);
    setSnackbarVisible(true);
  };

  // Delete address
  const deleteAddress = () => {
    if (!addressToDelete) return;

    const updatedAddresses = addresses.filter(addr => addr.id !== addressToDelete.id);

    // If the deleted address was the default, set a new default
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
    setDeleteDialogVisible(false);
    setAddressToDelete(null);

    setSnackbarMessage('Address deleted successfully');
    setSnackbarVisible(true);
  };

  // Set address as default
  const setAddressAsDefault = (address) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === address.id
    }));

    setAddresses(updatedAddresses);

    setSnackbarMessage('Default address updated');
    setSnackbarVisible(true);
  };

  // Select address for delivery
  const selectAddressForDelivery = (address) => {
    setSelectedAddress(address);
    setDeliveryAddress(address);

    // Navigate back to checkout
    navigation.goBack();
  };

  // Render address item
  const renderAddressItem = ({ item }) => (
    <Card style={styles.addressCard}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}

      <Card.Content>
        <View style={styles.addressHeader}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={24} color="#ff6b00" />
          </View>

          <View style={styles.addressDetails}>
            <Text style={styles.addressLine}>
              {item.addressLine1}
              {item.addressLine2 ? `, ${item.addressLine2}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {item.city}, {item.state} {item.postalCode}
            </Text>
            {item.landmark && (
              <Text style={styles.landmark}>Landmark: {item.landmark}</Text>
            )}
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={styles.cardActions}>
        {selectMode ? (
          <Button
            mode="contained"
            onPress={() => selectAddressForDelivery(item)}
            style={styles.selectButton}
          >
            Deliver Here
          </Button>
        ) : (
          <>
            {!item.isDefault && (
              <Button
                onPress={() => setAddressAsDefault(item)}
                style={styles.actionButton}
              >
                Set as Default
              </Button>
            )}
            <Button
              onPress={() => editAddress(item)}
              style={styles.actionButton}
            >
              Edit
            </Button>
            <IconButton
              icon="delete"
              color="#e74c3c"
              size={20}
              onPress={() => {
                setAddressToDelete(item);
                setDeleteDialogVisible(true);
              }}
            />
          </>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <LoadingIndicator fullScreen text="Loading addresses..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage error={error} />
        <Button
          mode="contained"
          onPress={() => setLoading(true)}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addresses.length === 0 ? (
        <EmptyState
          title="No Addresses Found"
          message="Add your delivery addresses to make checkout faster."
          buttonText="Add New Address"
          onButtonPress={addNewAddress}
        />
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.addressList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add New Address"
        onPress={addNewAddress}
      />

      {/* Add/Edit Address Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>{editMode ? 'Edit Address' : 'Add New Address'}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <View style={styles.dialogContent}>
              <TextInput
                label="Address Line 1 *"
                value={currentAddress.addressLine1}
                onChangeText={(text) => setCurrentAddress({...currentAddress, addressLine1: text})}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Address Line 2 (Optional)"
                value={currentAddress.addressLine2}
                onChangeText={(text) => setCurrentAddress({...currentAddress, addressLine2: text})}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="City *"
                value={currentAddress.city}
                onChangeText={(text) => setCurrentAddress({...currentAddress, city: text})}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="State *"
                value={currentAddress.state}
                onChangeText={(text) => setCurrentAddress({...currentAddress, state: text})}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Postal Code *"
                value={currentAddress.postalCode}
                onChangeText={(text) => setCurrentAddress({...currentAddress, postalCode: text})}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
              />

              <TextInput
                label="Landmark (Optional)"
                value={currentAddress.landmark}
                onChangeText={(text) => setCurrentAddress({...currentAddress, landmark: text})}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.defaultContainer}>
                <Text>Set as default address</Text>
                <Switch
                  value={currentAddress.isDefault}
                  onValueChange={(value) => setCurrentAddress({...currentAddress, isDefault: value})}
                  color="#ff6b00"
                />
              </View>

              <Button
                mode="outlined"
                onPress={getCurrentLocation}
                style={styles.locationButton}
                icon="map-marker"
                loading={locationLoading}
                disabled={locationLoading}
              >
                Use Current Location
              </Button>
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveAddress} mode="contained">Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Address Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Address</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete this address?
              {addressToDelete?.isDefault && ' This is your default address.'}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={deleteAddress}
              color="#e74c3c"
            >
              Delete
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
  addressList: {
    padding: 16,
  },
  addressCard: {
    marginBottom: 16,
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff6b00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    zIndex: 1,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressLine: {
    fontSize: 16,
    marginBottom: 4,
  },
  landmark: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  cardActions: {
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    marginHorizontal: 4,
  },
  selectButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff6b00',
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
  },
  dialogContent: {
    paddingVertical: 8,
  },
  input: {
    marginBottom: 12,
  },
  defaultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  locationButton: {
    marginTop: 8,
  },
  retryButton: {
    margin: 16,
  },
});

export default AddressesScreen;

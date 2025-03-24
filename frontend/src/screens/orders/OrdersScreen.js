import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Text, Chip, Divider, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as orderService from '../../services/order';
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../../utils/helpers';
import { subscribeToEvent, unsubscribeFromEvent } from '../../services/socket';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled'];

  // Load orders when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();

      // Subscribe to order updates
      const handleOrderUpdate = (updatedOrder) => {
        setOrders(prevOrders => {
          const index = prevOrders.findIndex(order => order.id === updatedOrder.id);

          if (index !== -1) {
            const newOrders = [...prevOrders];
            newOrders[index] = updatedOrder;
            return newOrders;
          }

          return [updatedOrder, ...prevOrders];
        });
      };

      subscribeToEvent('orderUpdate', handleOrderUpdate);

      return () => {
        unsubscribeFromEvent('orderUpdate', handleOrderUpdate);
      };
    }, [])
  );

  // Filter orders when selected status changes
  useEffect(() => {
    filterOrders();
  }, [selectedStatus, orders]);

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (user.role === 'admin' || user.role === 'staff') {
        // Admin/staff can see all orders
        result = await orderService.getAllOrders();
      } else {
        // Customers can only see their own orders
        result = await orderService.getOrdersByUser(user.id);
      }

      if (result.success) {
        // Sort orders by date (newest first)
        const sortedOrders = result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter orders by status
  const filterOrders = () => {
    if (selectedStatus === 'All') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        order => order.orderStatus.toLowerCase() === selectedStatus.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Handle order press
  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  // Render status chip
  const renderStatusChip = (status) => (
    <Chip
      key={status}
      selected={selectedStatus === status}
      onPress={() => setSelectedStatus(status)}
      style={[
        styles.statusChip,
        selectedStatus === status && { backgroundColor: getOrderStatusColor(status.toLowerCase()) }
      ]}
      textStyle={[
        styles.statusChipText,
        selectedStatus === status && styles.selectedStatusChipText
      ]}
    >
      {status}
    </Chip>
  );

  // Render order item
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getOrderStatusColor(item.orderStatus) }]}
          textStyle={styles.selectedStatusChipText}
        >
          {item.orderStatus.toUpperCase()}
        </Chip>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>{formatDateTime(item.createdAt)}</Text>
        <Text style={styles.orderType}>{item.orderType.toUpperCase()}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemText} numberOfLines={1}>
            {orderItem.quantity}x {orderItem.dish.name} ({orderItem.variant.name})
          </Text>
        ))}

        {item.items.length > 2 && (
          <Text style={styles.moreItemsText}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {item.items.reduce((sum, i) => sum + i.quantity, 0)} items
        </Text>
        <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="My Orders" />
      </Appbar.Header>

      <View style={styles.statusFilterContainer}>
        <FlatList
          data={statusOptions}
          renderItem={({ item }) => renderStatusChip(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterList}
        />
      </View>

      {loading && !refreshing ? (
        <LoadingIndicator text="Loading orders..." />
      ) : error ? (
        <ErrorMessage error={error} style={styles.error} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          message={
            selectedStatus === 'All'
              ? "You haven't placed any orders yet."
              : `You don't have any ${selectedStatus.toLowerCase()} orders.`
          }
          buttonText={selectedStatus === 'All' ? "Browse Menu" : "View All Orders"}
          onButtonPress={() => {
            if (selectedStatus === 'All') {
              navigation.navigate('MenuTab');
            } else {
              setSelectedStatus('All');
            }
          }}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  statusFilterList: {
    paddingHorizontal: 16,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  statusChipText: {
    color: '#333',
  },
  selectedStatusChipText: {
    color: '#fff',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
  },
  error: {
    margin: 16,
  },
});

export default OrdersScreen;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as orderService from '../../services/order';
import * as dishService from '../../services/dish';
import * as promoCodeService from '../../services/promo-code';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalDishes: 0,
    totalPromos: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all orders
      const ordersResult = await orderService.getAllOrders();

      if (!ordersResult.success) {
        throw new Error(ordersResult.error);
      }

      const orders = ordersResult.data;

      // Get all dishes
      const dishesResult = await dishService.getAllDishes();

      if (!dishesResult.success) {
        throw new Error(dishesResult.error);
      }

      const dishes = dishesResult.data;

      // Get all promo codes
      const promoCodesResult = await promoCodeService.getAllPromoCodes();

      if (!promoCodesResult.success) {
        throw new Error(promoCodesResult.error);
      }

      const promoCodes = promoCodesResult.data;

      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.orderStatus)
      ).length;
      const totalRevenue = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      const totalDishes = dishes.length;
      const totalPromos = promoCodes.length;

      // Get recent orders (last 5)
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalDishes,
        totalPromos,
      });

      setRecentOrders(recent);
    } catch (error) {
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Render stat card
  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity style={styles.statCardContainer} onPress={onPress}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statCardContent}>
          <Avatar.Icon
            icon={icon}
            size={50}
            style={[styles.statIcon, { backgroundColor: color }]}
          />
          <View style={styles.statInfo}>
            <Paragraph style={styles.statTitle}>{title}</Paragraph>
            <Title style={styles.statValue}>{value}</Title>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Render order item
  const renderOrderItem = (order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <Text style={[
          styles.orderStatus,
          { color: getStatusColor(order.orderStatus) }
        ]}>
          {order.orderStatus.toUpperCase()}
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderType}>{order.orderType}</Text>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderItems}>
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
      </View>

      <Divider style={styles.divider} />
    </TouchableOpacity>
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#3498db';
      case 'preparing':
        return '#9b59b6';
      case 'ready':
        return '#2ecc71';
      case 'delivered':
        return '#27ae60';
      case 'completed':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  if (loading) {
    return <LoadingIndicator fullScreen text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage error={error} />
        <Button
          mode="contained"
          onPress={loadDashboardData}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Total Orders',
          stats.totalOrders,
          'receipt',
          '#3498db',
          () => navigation.navigate('OrderManagement')
        )}

        {renderStatCard(
          'Pending Orders',
          stats.pendingOrders,
          'time',
          '#f39c12',
          () => navigation.navigate('OrderManagement', { status: 'pending' })
        )}

        {renderStatCard(
          'Total Revenue',
          formatCurrency(stats.totalRevenue),
          'cash',
          '#2ecc71',
          () => {}
        )}
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Total Dishes',
          stats.totalDishes,
          'restaurant',
          '#9b59b6',
          () => navigation.navigate('DishManagement')
        )}

        {renderStatCard(
          'Total Promos',
          stats.totalPromos,
          'pricetag',
          '#e74c3c',
          () => navigation.navigate('PromoCodeManagement')
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddEditDish')}
          >
            <Ionicons name="add-circle" size={24} color="#ff6b00" />
            <Text style={styles.actionText}>Add Dish</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddEditPromoCode')}
          >
            <Ionicons name="pricetag" size={24} color="#ff6b00" />
            <Text style={styles.actionText}>Add Promo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderManagement')}
          >
            <Ionicons name="list" size={24} color="#ff6b00" />
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('OrderManagement')}
          >
            View All
          </Button>
        </View>

        {recentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No recent orders</Text>
        ) : (
          recentOrders.map(renderOrderItem)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b00',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCardContainer: {
    width: '50%',
    padding: 8,
  },
  statCard: {
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  orderItem: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  orderType: {
    fontSize: 14,
    color: '#666',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  orderItems: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
  },
  divider: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  retryButton: {
    margin: 16,
  },
});

export default AdminDashboardScreen;

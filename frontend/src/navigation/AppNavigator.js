import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import DishDetailScreen from '../screens/menu/DishDetailScreen';
import CartScreen from '../screens/menu/CartScreen';
import CheckoutScreen from '../screens/menu/CheckoutScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DishManagementScreen from '../screens/admin/DishManagementScreen';
// import AddEditDishScreen from '../screens/admin/AddEditDishScreen';
// import OrderManagementScreen from '../screens/admin/OrderManagementScreen';
// import PromoCodeManagementScreen from '../screens/admin/PromoCodeManagementScreen';
// import AddEditPromoCodeScreen from '../screens/admin/AddEditPromoCodeScreen';
// import QRCodeScannerScreen from '../screens/menu/QRCodeScannerScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Menu stack navigator
const MenuStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DishDetail" component={DishDetailScreen} options={{ title: 'Dish Details' }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    <Stack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} options={{ title: 'Scan QR Code' }} />
  </Stack.Navigator>
);

// Orders stack navigator
const OrdersStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
  </Stack.Navigator>
);

// Profile stack navigator
const ProfileStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'My Addresses' }} />
  </Stack.Navigator>
);

// Admin stack navigator
const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
    <Stack.Screen name="DishManagement" component={DishManagementScreen} options={{ title: 'Dish Management' }} />
    {/* <Stack.Screen name="AddEditDish" component={AddEditDishScreen} options={({ route }) => ({
      title: route.params?.dish ? 'Edit Dish' : 'Add Dish'
    })} />
    <Stack.Screen name="OrderManagement" component={OrderManagementScreen} options={{ title: 'Order Management' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    <Stack.Screen name="PromoCodeManagement" component={PromoCodeManagementScreen} options={{ title: 'Promo Codes' }} />
    <Stack.Screen name="AddEditPromoCode" component={AddEditPromoCodeScreen} options={({ route }) => ({
      title: route.params?.promoCode ? 'Edit Promo Code' : 'Add Promo Code'
    })} /> */}
  </Stack.Navigator>
);

// Main tab navigator
const MainTabNavigator = () => {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'MenuTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6b00',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="MenuTab"
        component={MenuStackNavigator}
        options={{
          headerShown: false,
          title: 'Menu'
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          headerShown: false,
          title: 'Orders'
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          title: 'Profile'
        }}
      />
      {isAdmin() && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackNavigator}
          options={{
            headerShown: false,
            title: 'Admin'
          }}
        />
      )}
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;

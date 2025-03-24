import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Chip, FAB, Badge, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import * as dishService from '../../services/dish';
import DishCard from '../../components/common/DishCard';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const MenuScreen = () => {
  const navigation = useNavigation();
  const { cart } = useCart();

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get total items in cart
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Load dishes and categories
  useEffect(() => {
    loadDishes();
    loadCategories();
  }, []);

  // Load dishes
  const loadDishes = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dishService.getAllDishes();

      if (result.success) {
        setDishes(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load dishes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const result = await dishService.getCategories();

      if (result.success) {
        setCategories(['All', ...result.data]);
      }
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  // Filter dishes by category and search query
  const filteredDishes = dishes.filter(dish => {
    // Filter by category
    const categoryMatch = selectedCategory === 'All' || dish.category === selectedCategory;

    // Filter by search query
    const searchMatch = !searchQuery ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Handle dish press
  const handleDishPress = (dish) => {
    navigation.navigate('DishDetail', { dish });
  };

  // Render category chip
  const renderCategoryChip = (category) => (
    <Chip
      key={category}
      selected={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category && styles.selectedCategoryChipText
      ]}
    >
      {category}
    </Chip>
  );

  // Render dish item
  const renderDishItem = ({ item }) => (
    <DishCard dish={item} onPress={() => handleDishPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Menu" />
        <Appbar.Action
          icon="qrcode-scan"
          onPress={() => navigation.navigate('QRCodeScanner')}
        />
        <Appbar.Action
          icon="cart"
          onPress={() => navigation.navigate('Cart')}
        />
        {cartItemCount > 0 && (
          <Badge style={styles.badge}>{cartItemCount}</Badge>
        )}
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search dishes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading ? (
        <LoadingIndicator text="Loading menu..." />
      ) : error ? (
        <ErrorMessage error={error} style={styles.error} />
      ) : filteredDishes.length === 0 ? (
        <EmptyState
          title="No Dishes Found"
          message={
            searchQuery
              ? `No dishes match "${searchQuery}"`
              : `No dishes available in ${selectedCategory} category`
          }
          buttonText="Clear Filters"
          onButtonPress={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <FlatList
          data={filteredDishes}
          renderItem={renderDishItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.dishesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {cartItemCount > 0 && (
        <FAB
          style={styles.fab}
          icon="cart"
          label={`View Cart (${cartItemCount})`}
          onPress={() => navigation.navigate('Cart')}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#ff6b00',
  },
  categoryChipText: {
    color: '#333',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  dishesList: {
    padding: 16,
  },
  error: {
    margin: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff6b00',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b00',
  },
});

export default MenuScreen;

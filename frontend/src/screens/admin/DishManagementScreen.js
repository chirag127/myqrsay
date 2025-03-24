import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  FAB,
  Card,
  Title,
  Paragraph,
  Switch,
  Divider,
  IconButton,
  Menu,
  Dialog,
  Button,
  Portal,
  Snackbar
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as dishService from '../../services/dish';
import { formatCurrency } from '../../utils/helpers';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const DishManagementScreen = () => {
  const navigation = useNavigation();

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load dishes when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadDishes();
      loadCategories();
      return () => {};
    }, [])
  );

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

  // Handle dish availability toggle
  const handleAvailabilityToggle = async (dish) => {
    try {
      const result = await dishService.updateDishAvailability(
        dish.id,
        !dish.isAvailable
      );

      if (result.success) {
        // Update dish in state
        setDishes(prevDishes =>
          prevDishes.map(d =>
            d.id === dish.id ? { ...d, isAvailable: !d.isAvailable } : d
          )
        );

        setSnackbarMessage(
          `${dish.name} is now ${!dish.isAvailable ? 'available' : 'unavailable'}`
        );
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage(result.error || 'Failed to update availability');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to update availability');
      setSnackbarVisible(true);
    }
  };

  // Handle dish edit
  const handleEditDish = (dish) => {
    setMenuVisible(false);
    navigation.navigate('AddEditDish', { dish });
  };

  // Handle dish delete
  const handleDeleteDish = async () => {
    if (!selectedDish) return;

    setDeleteLoading(true);

    try {
      const result = await dishService.deleteDish(selectedDish.id);

      if (result.success) {
        // Remove dish from state
        setDishes(prevDishes =>
          prevDishes.filter(d => d.id !== selectedDish.id)
        );

        setSnackbarMessage(`${selectedDish.name} has been deleted`);
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage(result.error || 'Failed to delete dish');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to delete dish');
      setSnackbarVisible(true);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogVisible(false);
      setSelectedDish(null);
    }
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
    <Card style={styles.dishCard}>
      <View style={styles.dishHeader}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.dishImage} />
        )}
        <View style={styles.dishInfo}>
          <Title style={styles.dishName}>{item.name}</Title>
          <Paragraph style={styles.dishCategory}>{item.category}</Paragraph>
          <Paragraph style={styles.dishPrice}>
            {formatCurrency(item.basePrice)}
          </Paragraph>
        </View>
        <Menu
          visible={menuVisible && selectedDish?.id === item.id}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedDish(item);
                setMenuVisible(true);
              }}
            />
          }
        >
          <Menu.Item
            icon="pencil"
            onPress={() => handleEditDish(item)}
            title="Edit"
          />
          <Menu.Item
            icon="delete"
            onPress={() => {
              setMenuVisible(false);
              setDeleteDialogVisible(true);
            }}
            title="Delete"
          />
        </Menu>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.dishFooter}>
        <View style={styles.variantsContainer}>
          {item.variants.slice(0, 2).map((variant, index) => (
            <Chip key={index} style={styles.variantChip} textStyle={styles.variantText}>
              {variant.name}: {formatCurrency(variant.price)}
            </Chip>
          ))}
          {item.variants.length > 2 && (
            <Chip style={styles.variantChip} textStyle={styles.variantText}>
              +{item.variants.length - 2} more
            </Chip>
          )}
        </View>

        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityLabel}>Available</Text>
          <Switch
            value={item.isAvailable}
            onValueChange={() => handleAvailabilityToggle(item)}
            color="#ff6b00"
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
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
        <LoadingIndicator text="Loading dishes..." />
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
          buttonText="Add New Dish"
          onButtonPress={() => navigation.navigate('AddEditDish')}
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

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Dish"
        onPress={() => navigation.navigate('AddEditDish')}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Dish</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{selectedDish?.name}"? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleDeleteDish}
              loading={deleteLoading}
              disabled={deleteLoading}
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
  dishCard: {
    marginBottom: 16,
    elevation: 2,
  },
  dishHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dishCategory: {
    fontSize: 14,
    color: '#666',
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b00',
  },
  divider: {
    marginHorizontal: 16,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  variantChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  variantText: {
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#666',
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
});

export default DishManagementScreen;

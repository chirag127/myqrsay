import React, { useState, useEffect } from 'react';
import { Container, Box, Grid } from '@mui/material';
import RestaurantHeader from '../components/RestaurantHeader';
import SearchBar from '../components/SearchBar';
import Navigation from '../components/Navigation';
import MenuList from '../components/MenuList';
import Cart from '../components/Cart';
import { menuItems, categories, restaurantDetails } from '../utils/menuData';
import { useCart } from '../context/CartContext';

const RestaurantDetail = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState(menuItems);

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity
  } = useCart();

  // Filter items based on search query and active filter
  useEffect(() => {
    let filtered = menuItems;

    // Apply category filter
    if (activeFilter === 'veg') {
      filtered = filtered.filter(item => item.isVeg);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleAddToCart = (item) => {
    addItem(item);
  };

  // Group items by category
  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(
      item => item.category === category.id
    );

    if (categoryItems.length > 0) {
      acc[category.id] = {
        name: category.name,
        items: categoryItems,
      };
    }

    return acc;
  }, {});

  return (
    <Box>
      <RestaurantHeader
        restaurantName={restaurantDetails.name}
        operatingHours={restaurantDetails.operatingHours}
        gstNumber={restaurantDetails.gstNumber}
        fssaiNumber={restaurantDetails.fssaiNumber}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Navigation onFilterChange={handleFilterChange} />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {Object.keys(groupedItems).map(categoryId => (
              <Box key={categoryId} mb={4}>
                <MenuList
                  title={groupedItems[categoryId].name}
                  items={groupedItems[categoryId].items}
                  onAddToCart={handleAddToCart}
                />
              </Box>
            ))}

            {filteredItems.length === 0 && (
              <Box textAlign="center" py={4}>
                No items found.
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Cart
              cartItems={cartItems}
              onRemoveItem={removeItem}
              onUpdateQuantity={updateQuantity}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RestaurantDetail;
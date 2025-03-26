import React from 'react';
import { Box, Button, styled } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EcoIcon from '@mui/icons-material/Eco';

const NavigationContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
  backgroundColor: '#fff',
  borderBottom: '1px solid #eee',
}));

const Navigation = ({ onFilterChange }) => {
  return (
    <NavigationContainer>
      <Button
        variant="outlined"
        startIcon={<EcoIcon />}
        onClick={() => onFilterChange('veg')}
      >
        Pure Veg
      </Button>
      <Button
        variant="outlined"
        startIcon={<RestaurantMenuIcon />}
        onClick={() => onFilterChange('menu')}
      >
        Menu
      </Button>
    </NavigationContainer>
  );
};

export default Navigation;
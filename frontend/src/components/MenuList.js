import React from 'react';
import { Box, Typography } from '@mui/material';
import MenuItem from './MenuItem';

const MenuList = ({ title, items, onAddToCart }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
        />
      ))}
    </Box>
  );
};

export default MenuList;
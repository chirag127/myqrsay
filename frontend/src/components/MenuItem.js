import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import VegIcon from '@mui/icons-material/Spa';

const MenuItem = ({ item, onAddToCart }) => {
  const { id, name, description, price, isVeg, image } = item;

  return (
    <Card sx={{ mb: 2 }}>
      <Grid container>
        <Grid item xs={3}>
          <CardMedia
            component="img"
            height="140"
            image={image}
            alt={name}
          />
        </Grid>
        <Grid item xs={9}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">
                  {name}
                  {isVeg && (
                    <Chip
                      icon={<VegIcon />}
                      label="Veg"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{price}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onAddToCart(item)}
              >
                ADD
              </Button>
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default MenuItem;
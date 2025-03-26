import React from 'react';
import { Typography, Box, Button, styled } from '@mui/material';

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
  color: 'white',
  padding: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
}));

const RestaurantHeader = ({
  restaurantName,
  operatingHours,
  gstNumber,
  fssaiNumber
}) => {
  return (
    <HeaderContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        {restaurantName || 'Hotel Name'}
      </Typography>
      <Typography variant="subtitle1">
        {operatingHours || 'Time - 12:00 AM - 12:00 AM'}
      </Typography>
      <Box mt={2}>
        <Typography variant="body2">
          GST Number: {gstNumber || '09ABTF5941G1ZW'}
        </Typography>
        <Typography variant="body2">
          FSSAI Number: {fssaiNumber || '12721052000582'}
        </Typography>
      </Box>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: '1rem' }}
        >
          GOOGLE REVIEW
        </Button>
        <Button variant="contained" color="primary">
          CONTACT
        </Button>
      </Box>
    </HeaderContainer>
  );
};

export default RestaurantHeader;
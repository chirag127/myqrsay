import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RestaurantDetail from './pages/RestaurantDetail';
import theme from './utils/theme';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/restaurant" element={<RestaurantDetail />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/" element={<RestaurantDetail />} />
          </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import { Box, TextField, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchContainer = styled(Box)(({ theme }) => ({
  background: '#e74c3c',
  padding: theme.spacing(2),
  position: 'sticky',
  top: 0,
  zIndex: 100,
}));

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <SearchContainer>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search Dishes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon />,
          style: { background: 'white', borderRadius: '4px' }
        }}
      />
    </SearchContainer>
  );
};

export default SearchBar;
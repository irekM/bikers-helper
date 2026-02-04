'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from '@/components/search/SearchBar';
// import DatePickerComponent from '@/components/datePicker/DatePicker'
export default function Navbar() {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>

        {/* menu hamburger */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo /title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          BikersHelper
        </Typography>

        {/* SearchBar in the middle */}
        <SearchBar />

        {/* DatePicker  */}
        {/* <DatePicker /> */}

      </Toolbar>
    </AppBar>
  );
}

import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#CCCCCC',
      contrastText: '#1A1A1A',
    },
    secondary: {
      main: '#2D2D2D',
      light: '#3D3D3D',
      dark: '#1D1D1D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          boxShadow: 'none',
          borderBottom: '1px solid #3D3D3D',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#3D3D3D',
          '&:hover': {
            backgroundColor: '#4D4D4D',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2D2D2D',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#3D3D3D',
            },
            '&:hover fieldset': {
              borderColor: '#4D4D4D',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#CCCCCC',
          borderColor: '#3D3D3D',
          '&.Mui-selected': {
            backgroundColor: '#3D3D3D',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#4D4D4D',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#3D3D3D',
          '&.Mui-checked': {
            color: '#FFFFFF',
          },
        },
      },
    },
  },
}); 
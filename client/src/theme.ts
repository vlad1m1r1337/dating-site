import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e91e8c' },
    secondary: { main: '#ff6b6b' },
    background: { default: '#0f0f0f', paper: '#1a1a1a' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 24, textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

export default theme;

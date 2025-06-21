import { createTheme } from '@mui/material/styles';

// Verde institucional Santo Tomás: #004F45 (nuevo)
const verdeSantoTomas = '#004F45';
const verdeOscuro = '#00362f';
const grisClaro = '#f5f5f5';
const grisOscuro = '#222';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: verdeSantoTomas,
      dark: verdeOscuro,
      light: '#00bfa5', // Color vibrante para interacciones
      contrastText: '#fff',
    },
    secondary: {
      main: '#1976d2',
    },
    background: {
      default: mode === 'dark' ? '#121212' : grisClaro,
      paper: mode === 'dark' ? '#1E1E1E' : '#fff',
    },
    text: {
      primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : '#222',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#555',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#fbc02d',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#43a047',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: 38 },
    h2: { fontWeight: 700, fontSize: 32 },
    h3: { fontWeight: 700, fontSize: 26 },
    h4: { fontWeight: 700, fontSize: 22 },
    h5: { fontWeight: 700, fontSize: 18 },
    h6: { fontWeight: 700, fontSize: 16 },
    button: { textTransform: 'none', fontWeight: 600 },
    subtitle1: { fontWeight: 500, fontSize: 16 },
    subtitle2: { fontWeight: 500, fontSize: 15 },
    body1: { fontSize: 15 },
    body2: { fontSize: 14 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          scrollbarColor: `${theme.palette.primary.dark} ${theme.palette.background.default}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: theme.palette.background.default,
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: theme.palette.primary.main,
            minHeight: 24,
            border: `2px solid ${theme.palette.background.default}`,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: theme.palette.background.default,
          },
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          letterSpacing: 0.5,
          minHeight: 40,
          boxShadow: 'none',
          transition: 'background 0.2s',
        },
        containedPrimary: {
          backgroundColor: verdeSantoTomas,
          '&:hover': { backgroundColor: verdeOscuro },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,79,69,0.10)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f4fbf8',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e0e0e0',
        },
        head: {
          fontWeight: 700,
          background: mode === 'dark' ? '#00362f' : '#e0f2f1',
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : verdeSantoTomas,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: 15,
          borderRadius: 10,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 14,
          borderRadius: 8,
          background: '#004F45',
        },
        arrow: {
          color: '#004F45',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover, &.Mui-selected': {
            backgroundColor: mode === 'dark' ? 'rgba(0, 191, 165, 0.1)' : '#e0f2f1',
            color: mode === 'dark' ? '#00bfa5' : '#004F45',
          },
        },
      },
    },
  },
});

export default function getTheme(mode) {
  return createTheme(getDesignTokens(mode));
}

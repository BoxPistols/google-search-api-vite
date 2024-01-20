import { createTheme } from '@mui/material/styles'

const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  bold: 700,
}

// colorのkeyにlighterを追加
declare module '@mui/material/styles' {
  // type PaletteColorOptions = ExtendedPaletteColor;
  interface PaletteColor {
    lighter?: string
  }
  interface SimplePaletteColorOptions {
    lighter?: string
  }
}

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1d6dd5',
      dark: '#1b4071',
      light: '#5b91d7',
      lighter: '#ccdcf2',
    },
    secondary: {
      main: '#736482',
      dark: '#403947',
      light: '#93889e',
      lighter: '#d9d5dd',
    },
    success: {
      main: '#67b411',
      dark: '#314f10',
      light: '#87d530',
      lighter: '#caeda4',
    },
    error: {
      main: '#dd4b35',
      dark: '#873225',
      light: '#da8578',
      lighter: '#f8e8e6',
    },
    warning: {
      main: '#f5a623',
      dark: '#9a6918',
      light: '#e9bb6f',
      lighter: '#fbf4e9',
    },
    info: {
      main: '#0dcce2',
      dark: '#146b75',
      light: '#4dd2e1',
      lighter: '#c6f0f5',
    },
  },
  typography: {
    fontFamily: `Nunito Sans, Helvetica Neue, Arial, sans-serif`,
    fontWeightRegular: fontWeights.normal,
    fontWeightMedium: fontWeights.medium,
    fontWeightBold: fontWeights.bold,
    h1: {
      fontWeight: fontWeights.bold,
      fontSize: '2.5rem',
      letterSpacing: '-0.05em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: fontWeights.medium,
        },
      },
    },
    // MuiTypography: {
    //   styleOverrides: {
    //     root: {},
    //   },
    // },
    // MuiCssBaseline: {
    //   styleOverrides: {
    //     body: {},
    //   },
    // },
  },
})

export default theme

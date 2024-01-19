import { createTheme } from '@mui/material/styles'

const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  bold: 700,
}
// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2359cf',
    },
    secondary: {
      main: '#6c757d',
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

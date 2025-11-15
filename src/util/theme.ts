import { createTheme, PaletteMode } from '@mui/material/styles';

const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  bold: 700,
};

// colorのkeyにlighterを追加
declare module '@mui/material/styles' {
  // type PaletteColorOptions = ExtendedPaletteColor;
  interface PaletteColor {
    lighter?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}

// ライトモードとダークモードのカラー定義を関数化
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
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
    ...(mode === 'light'
      ? {
          // ライトモード
          text: {
            primary: '#333',
            secondary: '#666',
            disabled: '#ccc',
          },
          background: {
            default: '#fff',
            paper: '#fff',
          },
          divider: '#ccc',
        }
      : {
          // ダークモード
          text: {
            primary: '#e0e0e0',
            secondary: '#b0b0b0',
            disabled: '#666',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          divider: '#444',
        }),
  },
});

// カスタムテーマを生成する関数
export const createCustomTheme = (mode: PaletteMode = 'light') => {
  const designTokens = getDesignTokens(mode);

  return createTheme({
    ...designTokens,
    typography: {
      fontFamily: `Nunito Sans, Helvetica Neue, Arial, sans-serif`,
      fontWeightRegular: fontWeights.normal,
      fontWeightMedium: fontWeights.medium,
      fontWeightBold: fontWeights.bold,
      h1: {
        fontWeight: fontWeights.bold,
        fontSize: 'clump(2.5rem, 8vw, 3rem)',
        letterSpacing: '-0.05em',
      },
      h2: {
        fontWeight: fontWeights.bold,
        fontSize: '2rem',
        letterSpacing: '-0.05em',
      },
      h3: {
        fontWeight: fontWeights.bold,
        fontSize: '1.75rem',
        letterSpacing: '-0.05em',
      },
      h4: {
        fontWeight: fontWeights.bold,
        fontSize: '1.5rem',
        letterSpacing: '-0.05em',
      },
      h5: {
        fontWeight: fontWeights.bold,
        fontSize: '1.25rem',
        letterSpacing: '-0.05em',
      },
      h6: {
        fontWeight: fontWeights.bold,
        fontSize: '1.125rem',
        letterSpacing: '-0.05em',
      },
      subtitle1: {
        fontWeight: fontWeights.normal,
        fontSize: '0.875rem',
        letterSpacing: '-0.05em',
      },
      subtitle2: {
        fontWeight: fontWeights.normal,
        fontSize: '0.75rem',
        letterSpacing: '-0.05em',
      },
      body1: {
        fontWeight: fontWeights.normal,
        fontSize: '1rem',
        letterSpacing: '-0.05em',
      },
      body2: {
        fontWeight: fontWeights.normal,
        fontSize: '0.875rem',
        letterSpacing: '-0.05em',
      },
      button: {
        fontWeight: fontWeights.medium,
        fontSize: '0.875rem',
        letterSpacing: '-0.05em',
        textTransform: 'uppercase',
      },
      caption: {
        fontWeight: fontWeights.normal,
        fontSize: '0.75rem',
        letterSpacing: '-0.05em',
      },
      overline: {
        fontWeight: fontWeights.normal,
        fontSize: '0.75rem',
        letterSpacing: '-0.05em',
        textTransform: 'uppercase',
      },
    },
    components: {
      // ボタンのスタイル
      MuiButton: {
        defaultProps: {
          variant: 'contained', // デフォルトのボタンの種類を設定
          disableElevation: true, // デフォルトの影を削除
          disableRipple: true, // デフォルトのrippleを削除
        },
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontWeight: fontWeights.medium,
            borderRadius: '4em',
          },
          contained: {
            // 背景がcontainedの時のスタイル
            '&.MuiButton-contained.MuiButton-root': {
              // textContrast カラーの設定
              color: '#fff',
              // disabledの時のスタイル
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
                color: '#666',
              },
            },
          },
        },
      },
      // MuiTypography: { styleOverrides: { root: {},}, },
      // MuiCssBaseline: { styleOverrides: { body: {}, }, },
    },
    // 現在1=8px の設定
    spacing: 8,
    // 全体の角丸
    shape: {
      borderRadius: 6,
    },
  });
};

// デフォルトのライトモードテーマをエクスポート（後方互換性のため）
const theme = createCustomTheme('light');
export default theme;

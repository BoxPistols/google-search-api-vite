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
    ...(mode === 'light'
      ? {
          // ライトモード - Material Designの標準カラー
          primary: {
            main: '#1976d2',
            dark: '#115293',
            light: '#42a5f5',
            lighter: '#e3f2fd',
          },
          secondary: {
            main: '#9c27b0',
            dark: '#6a1b9a',
            light: '#ba68c8',
            lighter: '#f3e5f5',
          },
          success: {
            main: '#2e7d32',
            dark: '#1b5e20',
            light: '#4caf50',
            lighter: '#e8f5e9',
          },
          error: {
            main: '#d32f2f',
            dark: '#c62828',
            light: '#ef5350',
            lighter: '#ffebee',
          },
          warning: {
            main: '#ed6c02',
            dark: '#e65100',
            light: '#ff9800',
            lighter: '#fff3e0',
          },
          info: {
            main: '#0288d1',
            dark: '#01579b',
            light: '#03a9f4',
            lighter: '#e1f5fe',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.60)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
          background: {
            default: '#fafafa',
            paper: '#ffffff',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // ダークモード - Material Design 3準拠のカラー
          primary: {
            main: '#90caf9', // 明るい青（ダークモード用）
            dark: '#5d99c6',
            light: '#bbdefb',
            lighter: '#1e3a5f',
          },
          secondary: {
            main: '#ce93d8', // 明るい紫（ダークモード用）
            dark: '#ab47bc',
            light: '#e1bee7',
            lighter: '#4a148c',
          },
          success: {
            main: '#66bb6a', // 明るい緑（ダークモード用）
            dark: '#43a047',
            light: '#81c784',
            lighter: '#1b5e20',
          },
          error: {
            main: '#f44336', // 明るい赤（ダークモード用）
            dark: '#d32f2f',
            light: '#e57373',
            lighter: '#b71c1c',
          },
          warning: {
            main: '#ffa726', // 明るいオレンジ（ダークモード用）
            dark: '#f57c00',
            light: '#ffb74d',
            lighter: '#e65100',
          },
          info: {
            main: '#29b6f6', // 明るい水色（ダークモード用）
            dark: '#0288d1',
            light: '#4fc3f7',
            lighter: '#01579b',
          },
          text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: 'rgba(255, 255, 255, 0.60)',
            disabled: 'rgba(255, 255, 255, 0.38)',
          },
          background: {
            default: '#121212', // Material Design推奨の暗い背景
            paper: '#1e1e1e', // わずかに明るいサーフェス
          },
          divider: 'rgba(255, 255, 255, 0.12)',
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
              // モードに応じたテキストカラー設定
              color: mode === 'light' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
              // disabledの時のスタイル
              '&.Mui-disabled': {
                backgroundColor:
                  mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.30)',
              },
            },
          },
        },
      },
      // Paper コンポーネントのエレベーション調整
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: mode === 'dark' ? 'none' : undefined,
            ...(mode === 'dark' && {
              backgroundColor: '#1e1e1e',
            }),
          },
        },
      },
      // カードコンポーネントの調整
      MuiCard: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundColor: '#1e1e1e',
              backgroundImage: 'none',
            }),
          },
        },
      },
      // CssBaselineでグローバルスタイルを設定
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            ...(mode === 'dark' && {
              backgroundColor: '#121212',
            }),
          },
        },
      },
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

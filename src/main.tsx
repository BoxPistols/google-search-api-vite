import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// import './index.css'
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
// emotionのキャッシュを生成

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from './util/theme.ts';
// import { theme } from "@boxpistols/githubactions-test";

// emotionのキャッシュを生成
const cache = createCache({
  // MuiのコンポーネントCSSに一意の接頭辞を付ける
  key: 'em',
  prepend: true,
  // これは不要なAutoPrefixer、IE設定などを無効にする処理
  stylisPlugins: [],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CacheProvider value={cache}>
        <CssBaseline />
      </CacheProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

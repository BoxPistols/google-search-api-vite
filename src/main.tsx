import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// import './index.css'
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./util/theme.ts";
// emotionのキャッシュを生成
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// emotionのキャッシュを生成
const cache = createCache({
  // MuiのコンポーネントCSSに一意の接頭辞を付ける
  key: "em",
  prepend: true,
  // これは不要なAutoPrefixer、IE設定などを無効にする処理
  stylisPlugins: [],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CacheProvider value={cache}>
        <CssBaseline />
      </CacheProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

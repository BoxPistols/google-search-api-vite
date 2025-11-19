# テストアーキテクチャ設計書

## 📋 目次

1. [テスト戦略](#テスト戦略)
2. [テストピラミッド](#テストピラミッド)
3. [テストの種類](#テストの種類)
4. [テストツール](#テストツール)
5. [テストカバレッジ](#テストカバレッジ)
6. [CI/CD統合](#cicd統合)
7. [ベストプラクティス](#ベストプラクティス)

---

## テスト戦略

### テストの目的

1. **品質保証**: バグの早期発見
2. **リファクタリング支援**: 安心してコード変更
3. **ドキュメント**: コードの使用方法を示す
4. **設計改善**: テスタブルなコード設計

### テストの原則

```typescript
// ✅ FIRST原則
// Fast: 高速
// Independent: 独立
// Repeatable: 再現可能
// Self-validating: 自己検証
// Timely: タイムリー

// ✅ AAA パターン
// Arrange: 準備
// Act: 実行
// Assert: 検証
```

---

## テストピラミッド

```
        /\
       /  \  E2E Tests (5%)
      /----\
     /      \  Integration Tests (15%)
    /--------\
   /          \
  /   Unit     \  Unit Tests (80%)
 /--------------\
```

### 推奨割合

| テスト種類 | 割合 | 特徴 | 実行時間 |
|----------|------|------|---------|
| **ユニットテスト** | 80% | 高速・安価 | <1秒 |
| **統合テスト** | 15% | 中速・中コスト | 1-5秒 |
| **E2Eテスト** | 5% | 低速・高コスト | 10-60秒 |

---

## テストの種類

### 1. ユニットテスト

**対象**: 個々の関数・コンポーネント

**ツール**: Vitest + React Testing Library

#### 例: Utility関数のテスト

```typescript
// src/utils/__tests__/apiQuotaManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordQueryUsage,
  getRemainingQueries,
  canExecuteQuery,
} from '../apiQuotaManager';

describe('apiQuotaManager', () => {
  beforeEach(() => {
    // テストデータをリセット
    localStorage.clear();
  });

  describe('recordQueryUsage', () => {
    it('should record query usage', () => {
      recordQueryUsage('test query', 5);

      const quotaData = JSON.parse(localStorage.getItem('quotaData') || '{}');
      expect(quotaData.queriesUsed).toBe(5);
    });

    it('should reset on new day', () => {
      // 昨日のデータを設定
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      localStorage.setItem('quotaData', JSON.stringify({
        date: yesterday.toISOString().split('T')[0],
        queriesUsed: 50,
      }));

      recordQueryUsage('test', 5);

      const quotaData = JSON.parse(localStorage.getItem('quotaData') || '{}');
      expect(quotaData.queriesUsed).toBe(5); // リセットされて5のみ
    });
  });

  describe('getRemainingQueries', () => {
    it('should return remaining queries', () => {
      recordQueryUsage('test', 30);

      const remaining = getRemainingQueries();
      expect(remaining).toBe(70); // 100 - 30 = 70
    });

    it('should not return negative values', () => {
      recordQueryUsage('test', 150);

      const remaining = getRemainingQueries();
      expect(remaining).toBe(0);
    });
  });

  describe('canExecuteQuery', () => {
    it('should allow query when quota available', () => {
      recordQueryUsage('test', 50);

      expect(canExecuteQuery(30)).toBe(true);
    });

    it('should deny query when quota exceeded', () => {
      recordQueryUsage('test', 95);

      expect(canExecuteQuery(10)).toBe(false);
    });
  });
});
```

#### 例: コンポーネントのテスト

```typescript
// src/components/__tests__/SearchForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from '../SearchForm';

describe('SearchForm', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('should render search input', () => {
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    expect(input).toBeInTheDocument();
  });

  it('should calculate estimated queries', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    await user.type(input, 'React TypeScript');

    // 2キーワード × 2ページ = 4クエリ
    expect(screen.getByText(/消費クエリ: 4/i)).toBeInTheDocument();
  });

  it('should call onSearch on submit', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    const button = screen.getByRole('button', { name: /検索/i });

    await user.type(input, 'test query');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.any(String), // apiKey
      expect.any(String), // cx
      'test query'
    );
  });

  it('should disable button when quota insufficient', () => {
    // クォータを使い切る
    recordQueryUsage('test', 100);

    render(<SearchForm onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /検索/i });
    expect(button).toBeDisabled();
  });

  it('should show warning when quota low', async () => {
    const user = userEvent.setup();
    recordQueryUsage('test', 90); // 残り10クエリ

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    await user.type(input, 'test query'); // 2クエリ消費予定

    expect(screen.getByText(/残りクォータが少なく/i)).toBeInTheDocument();
  });
});
```

---

### 2. 統合テスト

**対象**: 複数コンポーネント・API連携

#### 例: 検索フローのテスト

```typescript
// src/__tests__/integration/searchFlow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Google API をモック
global.fetch = vi.fn();

describe('Search Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // APIレスポンスをモック
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            title: 'Test Result 1',
            link: 'https://example.com/1',
            snippet: 'Test snippet 1',
            displayLink: 'example.com',
          },
          {
            title: 'Test Result 2',
            link: 'https://example.com/2',
            snippet: 'Test snippet 2',
            displayLink: 'example.com',
          },
        ],
      }),
    });
  });

  it('should complete full search flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. 検索フォームに入力
    const input = screen.getByPlaceholderText(/キーワード/i);
    await user.type(input, 'React');

    // 2. 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: /検索/i });
    await user.click(searchButton);

    // 3. ローディング表示
    expect(screen.getByText(/検索中/i)).toBeInTheDocument();

    // 4. 結果が表示される
    await waitFor(() => {
      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
      expect(screen.getByText('Test Result 2')).toBeInTheDocument();
    });

    // 5. クォータが更新される
    const quotaDisplay = screen.getByText(/使用済み:/i);
    expect(quotaDisplay).toHaveTextContent('2'); // 2クエリ消費

    // 6. ドメイン分析が表示される
    expect(screen.getByText(/ドメイン分析/i)).toBeInTheDocument();
    expect(screen.getByText(/example.com/i)).toBeInTheDocument();

    // 7. エクスポートボタンが有効になる
    const exportButton = screen.getByLabelText(/export/i);
    expect(exportButton).toBeEnabled();
  });

  it('should handle API error gracefully', async () => {
    const user = userEvent.setup();

    // エラーレスポンスをモック
    (global.fetch as any).mockRejectedValue(new Error('API Error'));

    render(<App />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    await user.type(input, 'test');

    const searchButton = screen.getByRole('button', { name: /検索/i });
    await user.click(searchButton);

    // エラートースト表示
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生/i)).toBeInTheDocument();
    });
  });

  it('should prevent search when quota exceeded', async () => {
    const user = userEvent.setup();

    // クォータを使い切る
    recordQueryUsage('test', 100);

    render(<App />);

    const input = screen.getByPlaceholderText(/キーワード/i);
    await user.type(input, 'test');

    const searchButton = screen.getByRole('button', { name: /検索/i });

    // ボタンが無効化されている
    expect(searchButton).toBeDisabled();
  });
});
```

---

### 3. E2Eテスト

**対象**: 実際のブラウザでのユーザーフロー

**ツール**: Playwright

#### 例: E2Eテスト

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search Ranking Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should perform basic search', async ({ page }) => {
    // 検索キーワードを入力
    await page.fill('input[placeholder*="キーワード"]', 'React');

    // クエリ消費量が表示される
    await expect(page.locator('text=消費クエリ: 2')).toBeVisible();

    // 検索ボタンをクリック
    await page.click('button:has-text("検索")');

    // ローディング表示
    await expect(page.locator('text=検索中')).toBeVisible();

    // 結果が表示される（最大30秒待機）
    await expect(page.locator('table tbody tr').first()).toBeVisible({
      timeout: 30000,
    });

    // ドメイン分析が表示される
    await expect(page.locator('text=ドメイン分析')).toBeVisible();
  });

  test('should export to PDF', async ({ page, context }) => {
    // 検索を実行
    await page.fill('input[placeholder*="キーワード"]', 'test');
    await page.click('button:has-text("検索")');

    await page.waitForSelector('table tbody tr');

    // エクスポートボタンをクリック
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[aria-label="export"]'),
      page.click('text=PDFでエクスポート'),
    ]);

    // ファイル名を確認
    expect(download.suggestedFilename()).toMatch(/search_ranking.*\.pdf/);
  });

  test('should toggle dark mode', async ({ page }) => {
    // 初期状態（ライトモード）
    const body = page.locator('body');
    await expect(body).not.toHaveClass(/dark/);

    // ダークモードボタンをクリック
    await page.click('button[aria-label*="ダークモード"]');

    // ダークモードに切り替わる
    await expect(body).toHaveClass(/dark/);

    // localStorage に保存される
    const darkMode = await page.evaluate(() => localStorage.getItem('darkMode'));
    expect(darkMode).toBe('true');
  });

  test('should work on mobile viewport', async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 667 });

    // ハンバーガーメニューが表示される
    await expect(page.locator('button[aria-label="menu"]')).toBeVisible();

    // 検索フォームが縦に並ぶ
    const searchForm = page.locator('form');
    const box = await searchForm.boundingBox();

    expect(box!.width).toBeLessThan(400);
  });

  test('should persist search history', async ({ page }) => {
    // 検索を実行
    await page.fill('input[placeholder*="キーワード"]', 'test query');
    await page.click('button:has-text("検索")');

    await page.waitForSelector('table tbody tr');

    // ページをリロード
    await page.reload();

    // 検索履歴が表示される
    await expect(page.locator('text=検索履歴')).toBeVisible();
    await page.click('text=検索履歴');

    await expect(page.locator('text=test query')).toBeVisible();
  });
});
```

---

### 4. パフォーマンステスト

**対象**: ページロード速度・レンダリング性能

#### Lighthouse CI

```yaml
# .lighthouserc.yml
ci:
  collect:
    url:
      - http://localhost:5173
    numberOfRuns: 3
  assert:
    preset: lighthouse:recommended
    assertions:
      categories:performance:
        - minScore: 0.9
      categories:accessibility:
        - minScore: 0.9
      categories:best-practices:
        - minScore: 0.9
      categories:seo:
        - minScore: 0.9
      first-contentful-paint:
        - maxNumericValue: 2000
      speed-index:
        - maxNumericValue: 3000
      largest-contentful-paint:
        - maxNumericValue: 2500
      interactive:
        - maxNumericValue: 3500
      cumulative-layout-shift:
        - maxNumericValue: 0.1
  upload:
    target: temporary-public-storage
```

#### Web Vitalsテスト

```typescript
// src/__tests__/performance/webVitals.test.ts
import { describe, it, expect } from 'vitest';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

describe('Web Vitals', () => {
  it('should have good CLS (< 0.1)', (done) => {
    getCLS((metric) => {
      expect(metric.value).toBeLessThan(0.1);
      done();
    });
  });

  it('should have good FID (< 100ms)', (done) => {
    getFID((metric) => {
      expect(metric.value).toBeLessThan(100);
      done();
    });
  });

  it('should have good LCP (< 2.5s)', (done) => {
    getLCP((metric) => {
      expect(metric.value).toBeLessThan(2500);
      done();
    });
  });
});
```

---

### 5. アクセシビリティテスト

**対象**: WCAG 2.1準拠

#### axe-core統合

```typescript
// src/__tests__/a11y/accessibility.test.tsx
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../App';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<App />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    const { getByLabelText, getByRole } = render(<App />);

    expect(getByLabelText(/検索/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /検索/i })).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const { getByPlaceholderText, getByRole } = render(<App />);

    const input = getByPlaceholderText(/キーワード/i);
    const button = getByRole('button', { name: /検索/i });

    // Tab navigation
    input.focus();
    expect(document.activeElement).toBe(input);

    // Tab to button
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(document.activeElement).toBe(button);

    // Enter to submit
    fireEvent.keyDown(button, { key: 'Enter' });
    // ... assertions
  });
});
```

---

## テストツール

### 推奨スタック

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@playwright/test": "^1.40.0",
    "@axe-core/react": "^4.8.0",
    "jest-axe": "^8.0.0",
    "web-vitals": "^3.5.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

## テストカバレッジ

### 目標

| 項目 | 目標 | 現状 |
|------|------|------|
| **Line Coverage** | 80% | - |
| **Function Coverage** | 80% | - |
| **Branch Coverage** | 75% | - |
| **Statement Coverage** | 80% | - |

### カバレッジレポート

```bash
# カバレッジ実行
pnpm test:coverage

# HTML レポート生成
pnpm test:coverage --reporter=html

# CI用
pnpm test:coverage --reporter=lcov
```

### 除外対象

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    'node_modules/',
    'src/setupTests.ts',
    '**/*.d.ts',
    '**/*.config.*',
    '**/dist/**',
    'src/main.tsx',          // エントリーポイント
    'src/vite-env.d.ts',     // 型定義
    'src/design/tokens.ts',  // 定数のみ
  ],
}
```

---

## CI/CD統合

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Lighthouse CI
        run: pnpm lighthouse:ci
```

---

## ベストプラクティス

### 1. テストの命名規則

```typescript
// ❌ Bad
it('test 1', () => { ... });

// ✅ Good
it('should calculate remaining queries correctly', () => { ... });

// ✅ Better
it('should return 70 when 30 queries used out of 100 limit', () => { ... });
```

### 2. AAA パターン

```typescript
it('should increment query count', () => {
  // Arrange: 準備
  const initialCount = 0;
  localStorage.setItem('quotaData', JSON.stringify({
    date: new Date().toISOString().split('T')[0],
    queriesUsed: initialCount,
  }));

  // Act: 実行
  recordQueryUsage('test', 5);

  // Assert: 検証
  const quotaData = JSON.parse(localStorage.getItem('quotaData')!);
  expect(quotaData.queriesUsed).toBe(5);
});
```

### 3. モックの使用

```typescript
// ✅ Good: 依存を明確にモック
vi.mock('../utils/apiQuotaManager', () => ({
  getRemainingQueries: vi.fn(() => 50),
  canExecuteQuery: vi.fn(() => true),
}));

// ✅ Better: スパイで元の実装も保持
import * as quotaManager from '../utils/apiQuotaManager';

const getRemainingQueriesSpy = vi.spyOn(quotaManager, 'getRemainingQueries');
getRemainingQueriesSpy.mockReturnValue(50);
```

### 4. 非同期テスト

```typescript
// ❌ Bad
it('should fetch data', () => {
  fetchData().then(data => {
    expect(data).toBeDefined();
  });
});

// ✅ Good
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// ✅ Better: waitFor使用
it('should display results', async () => {
  render(<SearchResults />);

  await waitFor(() => {
    expect(screen.getByText('Results')).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

### 5. テストデータの管理

```typescript
// test/fixtures/searchResults.ts
export const mockSearchResults = [
  {
    title: 'Test Result 1',
    link: 'https://example.com/1',
    snippet: 'Test snippet 1',
    displayLink: 'example.com',
  },
  // ...
];

// テストで使用
import { mockSearchResults } from '../fixtures/searchResults';

it('should display search results', () => {
  render(<ResultsTable results={mockSearchResults} />);
  // ...
});
```

---

## まとめ

### テスト実行コマンド

```bash
# すべてのテスト
pnpm test

# ユニットテストのみ
pnpm test:unit

# 統合テストのみ
pnpm test:integration

# E2Eテスト
pnpm test:e2e

# カバレッジ
pnpm test:coverage

# ウォッチモード
pnpm test:watch

# Lighthouse
pnpm lighthouse:ci
```

### 品質ゲート

```typescript
// すべてパスすべき条件
const qualityGates = {
  unitTestPass: true,
  integrationTestPass: true,
  e2eTestPass: true,
  coverageAbove: 80,
  lighthouseScore: 90,
  a11yViolations: 0,
  buildSuccess: true,
};
```

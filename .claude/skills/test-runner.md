# Test Runner Skill

## Description

This skill provides comprehensive test execution capabilities for the Google Search Ranking Checker application.

## Usage

```bash
# Activate the skill
/test-runner [options]
```

## Examples

```bash
# Run all tests
/test-runner

# Run specific test file
/test-runner src/utils/apiQuotaManager.test.ts

# Run with coverage
/test-runner --coverage

# Run in watch mode
/test-runner --watch

# Run with UI
/test-runner --ui
```

## Parameters

- `testPath` (optional): Path to specific test file
- `--coverage`: Generate coverage report
- `--watch`: Run in watch mode (auto-rerun on file changes)
- `--ui`: Open Vitest UI in browser
- `--run`: Run once and exit (default)

## Workflow

### 1. Basic Test Execution

```bash
# Run all tests
/test-runner

# Output:
# ✓ src/utils/apiQuotaManager.test.ts (5)
# ✓ src/components/SearchForm.test.tsx (8)
# ✓ src/components/QuotaDisplay.test.tsx (6)
#
# Test Files: 3 passed (3)
# Tests: 19 passed (19)
# Duration: 2.5s
```

### 2. Coverage Report

```bash
# Generate coverage report
/test-runner --coverage

# Output:
# Coverage Report
# ===============
# File                    | % Stmts | % Branch | % Funcs | % Lines
# ----------------------- | ------- | -------- | ------- | -------
# All files              | 82.5    | 78.3     | 85.1    | 82.5
# utils/apiQuotaManager  | 95.2    | 90.5     | 100     | 95.2
# components/SearchForm  | 88.7    | 82.1     | 90.0    | 88.7
# components/QuotaDisplay| 75.3    | 70.2     | 80.0    | 75.3
```

### 3. Run Specific Test File

```bash
# Test a specific file
/test-runner src/utils/apiQuotaManager.test.ts

# Output:
# ✓ apiQuotaManager
#   ✓ should initialize with correct default values
#   ✓ should record query usage correctly
#   ✓ should calculate remaining queries
#   ✓ should reset quota at midnight
#   ✓ should handle multiple queries
#
# Test Files: 1 passed (1)
# Tests: 5 passed (5)
```

### 4. Watch Mode

```bash
# Run in watch mode
/test-runner --watch

# Output:
# WATCH MODE
#
# Watching for file changes...
# Press 'a' to run all tests
# Press 'f' to run only failed tests
# Press 'q' to quit
#
# ✓ All tests passed
```

### 5. UI Mode

```bash
# Open Vitest UI
/test-runner --ui

# Output:
# Vitest UI started at http://localhost:51204/__vitest__/
#
# Features:
# - Interactive test explorer
# - Real-time test results
# - Code coverage visualization
# - Test file filtering
# - Console output inspection
```

## Integration with MCP

This skill uses the `google-search-testing` MCP server to execute tests.

### MCP Tools Used

#### 1. run_tests

```typescript
// Run all tests
await run_tests({});

// Run specific test
await run_tests({
  testPath: "src/utils/apiQuotaManager.test.ts"
});

// Run with coverage
await run_tests({
  coverage: true
});
```

#### 2. get_test_status

```typescript
// Check if tests are currently running
const status = await get_test_status();

console.log(`Last run: ${status.lastRun}`);
console.log(`Is running: ${status.isRunning}`);
console.log(`Last results: ${status.lastResults}`);
```

#### 3. list_test_files

```typescript
// Get all test files
const files = await list_test_files();

console.log(`Found ${files.count} test files:`);
files.testFiles.forEach(file => console.log(`- ${file}`));
```

## Test Types

### Unit Tests

```typescript
// Example: apiQuotaManager.test.ts
describe('apiQuotaManager', () => {
  it('should initialize with correct default values', () => {
    const manager = new ApiQuotaManager();
    expect(manager.getRemainingQuota()).toBe(100);
  });
});
```

### Component Tests

```typescript
// Example: SearchForm.test.tsx
describe('SearchForm', () => {
  it('should render search input', () => {
    render(<SearchForm onSearch={vi.fn()} />);
    expect(screen.getByLabelText(/search keyword/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// Example: searchFlow.test.tsx
describe('Search Flow', () => {
  it('should perform complete search workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'React');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/results/i)).toBeInTheDocument();
    });
  });
});
```

## Coverage Thresholds

The project enforces the following coverage thresholds:

```json
{
  "lines": 80,
  "functions": 80,
  "branches": 75,
  "statements": 80
}
```

Tests will fail if coverage falls below these thresholds.

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good: Descriptive test names
it('should display error message when API quota is exceeded', () => {});

// ❌ Bad: Vague test names
it('should work', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate remaining quota correctly', () => {
  // Arrange
  const manager = new ApiQuotaManager();
  manager.recordQuery('test', 2);

  // Act
  const remaining = manager.getRemainingQuota();

  // Assert
  expect(remaining).toBe(98);
});
```

### 3. Cleanup After Tests

```typescript
afterEach(() => {
  cleanup(); // React Testing Library
  localStorage.clear();
  sessionStorage.clear();
});
```

### 4. Mock External Dependencies

```typescript
// Mock Google API
vi.mock('../services/googleApi', () => ({
  searchGoogle: vi.fn().mockResolvedValue({
    items: [/* mock data */],
  }),
}));
```

## Troubleshooting

### Tests Failing

```bash
# Run tests with verbose output
/test-runner --verbose

# Check specific test file
/test-runner src/path/to/failing.test.ts
```

### Coverage Below Threshold

```bash
# Generate detailed coverage report
/test-runner --coverage

# Check coverage by file:
# - Identify files with low coverage
# - Add missing test cases
# - Re-run coverage
```

### Test Timeout

```typescript
// Increase timeout for slow tests
it('should handle slow API request', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

## Performance Tips

### 1. Run Only Changed Tests

```bash
# Vitest automatically detects changed files in watch mode
/test-runner --watch
```

### 2. Parallel Test Execution

Vitest runs tests in parallel by default for better performance.

### 3. Mock Heavy Dependencies

```typescript
// Mock instead of importing real modules
vi.mock('recharts', () => ({
  LineChart: () => null,
  Line: () => null,
  // ... other mocks
}));
```

## Related Skills

- [coverage-checker](/coverage-checker) - Detailed coverage analysis
- [seo-analysis](/seo-analysis) - SEO analysis tools
- [quota-monitor](/quota-monitor) - API quota monitoring

## Dependencies

- Vitest: Test runner
- React Testing Library: Component testing
- Playwright (optional): E2E testing
- @vitest/ui: Interactive test UI
- @vitest/coverage-v8: Coverage reporting

## Summary

The Test Runner skill provides:

- ✅ **Fast Execution**: Vitest's parallel test execution
- ✅ **Interactive UI**: Browser-based test explorer
- ✅ **Coverage Reports**: Detailed coverage analysis
- ✅ **Watch Mode**: Auto-rerun on file changes
- ✅ **MCP Integration**: Run tests via Claude Desktop
- ✅ **CI/CD Ready**: Easy GitHub Actions integration

## Next Steps

1. [ ] Run initial test suite
2. [ ] Review coverage report
3. [ ] Add missing test cases
4. [ ] Set up CI/CD pipeline
5. [ ] Configure code coverage reporting

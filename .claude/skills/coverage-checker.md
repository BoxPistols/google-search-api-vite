# Coverage Checker Skill

## Description

This skill provides detailed test coverage analysis and reporting for the Google Search Ranking Checker application.

## Usage

```bash
# Activate the skill
/coverage-checker [options]
```

## Examples

```bash
# Generate coverage report
/coverage-checker

# Check specific file coverage
/coverage-checker src/utils/apiQuotaManager.ts

# Export coverage to file
/coverage-checker --export=json

# Set coverage threshold alerts
/coverage-checker --threshold=85
```

## Parameters

- `filePath` (optional): Check coverage for specific file
- `--export`: Export format (`json` | `html` | `lcov` | `text`)
- `--threshold`: Alert if coverage is below threshold (default: 80)
- `--diff`: Show coverage diff from last run
- `--uncovered`: Show only uncovered lines

## Workflow

### 1. Generate Coverage Report

```bash
/coverage-checker

# Output:
# ================================== Coverage Summary ==================================
# Statements   : 82.50% ( 330/400 )
# Branches     : 78.30% ( 157/200 )
# Functions    : 85.10% (  80/94  )
# Lines        : 82.50% ( 330/400 )
# ==================================================================================
#
# Coverage Status: ✅ PASSING (All thresholds met)
```

### 2. Detailed Coverage by File

```bash
/coverage-checker --detailed

# Output:
# ===================================== File Coverage =====================================
# File                                    | Stmts  | Branch | Funcs  | Lines  | Uncovered
# ---------------------------------------- | ------ | ------ | ------ | ------ | ---------
# src/utils/apiQuotaManager.ts           | 95.2%  | 90.5%  | 100%   | 95.2%  | 45-47
# src/components/SearchForm.tsx          | 88.7%  | 82.1%  | 90.0%  | 88.7%  | 102,115-120
# src/components/QuotaDisplay.tsx        | 75.3%  | 70.2%  | 80.0%  | 75.3%  | 23,45-52,78
# src/components/ResultsTable.tsx        | 92.1%  | 88.3%  | 95.0%  | 92.1%  | 156
# src/components/DomainAnalysis.tsx      | 80.5%  | 75.0%  | 85.0%  | 80.5%  | 67,89-95
# ========================================================================================
```

### 3. Check Specific File

```bash
/coverage-checker src/utils/apiQuotaManager.ts

# Output:
# Coverage for: src/utils/apiQuotaManager.ts
# ==========================================
# Statements   : 95.2% ( 60/63 )
# Branches     : 90.5% ( 19/21 )
# Functions    : 100%  ( 12/12 )
# Lines        : 95.2% ( 60/63 )
#
# Uncovered Lines: 45-47
#
# Missing Coverage:
#   Line 45: Error handling for invalid date format
#   Line 46: Edge case: negative quota values
#   Line 47: Return statement in error branch
#
# Recommendation:
# Add test cases for error handling and edge cases.
```

### 4. Coverage Trends

```bash
/coverage-checker --trend

# Output:
# Coverage Trend (Last 7 Days)
# ============================
# Date       | Stmts  | Change
# ---------- | ------ | ------
# 2025-11-19 | 82.5%  | +1.2%  ⬆️
# 2025-11-18 | 81.3%  | +0.5%  ⬆️
# 2025-11-17 | 80.8%  | -0.3%  ⬇️
# 2025-11-16 | 81.1%  | +2.1%  ⬆️
# 2025-11-15 | 79.0%  | --
#
# Overall Trend: ⬆️ Improving (+3.5% this week)
```

### 5. Uncovered Lines Report

```bash
/coverage-checker --uncovered

# Output:
# Uncovered Code Sections
# =======================
#
# HIGH PRIORITY (Core functionality)
# ----------------------------------
# 1. src/utils/apiQuotaManager.ts:45-47
#    Error handling for quota reset failure
#    Impact: High | Complexity: Low | Tests Needed: 2
#
# 2. src/components/SearchForm.tsx:102
#    Form validation edge case
#    Impact: Medium | Complexity: Low | Tests Needed: 1
#
# MEDIUM PRIORITY (UI Components)
# -------------------------------
# 3. src/components/QuotaDisplay.tsx:23
#    Display formatting for extreme values
#    Impact: Low | Complexity: Low | Tests Needed: 1
#
# LOW PRIORITY (Edge cases)
# -------------------------
# 4. src/components/DomainAnalysis.tsx:89-95
#    Empty state rendering
#    Impact: Low | Complexity: Low | Tests Needed: 1
```

## Integration with MCP

This skill uses the `google-search-testing` MCP server.

### MCP Tools Used

#### check_coverage

```typescript
// Get coverage report
const coverage = await check_coverage();

console.log(`Coverage Summary:
  Lines: ${coverage.coverage.lines.pct}%
  Branches: ${coverage.coverage.branches.pct}%
  Functions: ${coverage.coverage.functions.pct}%
  Statements: ${coverage.coverage.statements.pct}%
`);
```

## Coverage Analysis

### Coverage Types

#### 1. Statement Coverage

**Definition**: Percentage of executable statements that have been executed.

```typescript
// Example: 2 of 3 statements covered (66.67%)
function example(x: number) {
  const result = x * 2;        // ✅ Covered
  if (result > 10) {           // ✅ Covered
    return result;             // ❌ Not covered (never executed)
  }
  return 0;                    // ✅ Covered
}
```

#### 2. Branch Coverage

**Definition**: Percentage of conditional branches that have been executed.

```typescript
// Example: 1 of 2 branches covered (50%)
function checkValue(x: number) {
  if (x > 0) {                 // ✅ True branch covered
    return 'positive';
  } else {                     // ❌ False branch not covered
    return 'negative';
  }
}
```

#### 3. Function Coverage

**Definition**: Percentage of functions that have been called.

```typescript
// Example: 1 of 2 functions covered (50%)
function add(a: number, b: number) {    // ✅ Covered
  return a + b;
}

function multiply(a: number, b: number) { // ❌ Not covered
  return a * b;
}
```

#### 4. Line Coverage

**Definition**: Percentage of executable lines that have been executed.

```typescript
// Example: 3 of 4 lines covered (75%)
function process(data: string[]) {
  const filtered = data.filter(x => x);  // ✅ Covered
  const mapped = filtered.map(x => x.toUpperCase()); // ✅ Covered
  const sorted = mapped.sort();          // ❌ Not covered
  return sorted;                         // ✅ Covered
}
```

## Coverage Thresholds

### Current Thresholds

```json
{
  "lines": 80,
  "functions": 80,
  "branches": 75,
  "statements": 80
}
```

### Threshold Recommendations by File Type

| File Type          | Statements | Branches | Functions | Lines |
|-------------------|-----------|----------|-----------|-------|
| Core Utils        | 90%       | 85%      | 95%       | 90%   |
| Components        | 85%       | 80%      | 90%       | 85%   |
| Services/API      | 90%       | 85%      | 90%       | 90%   |
| UI/Styled         | 70%       | 65%      | 75%       | 70%   |
| Types/Interfaces  | N/A       | N/A      | N/A       | N/A   |

## Export Formats

### 1. JSON Export

```bash
/coverage-checker --export=json

# Output: coverage/coverage-final.json
```

```json
{
  "total": {
    "lines": { "total": 400, "covered": 330, "pct": 82.5 },
    "statements": { "total": 400, "covered": 330, "pct": 82.5 },
    "functions": { "total": 94, "covered": 80, "pct": 85.1 },
    "branches": { "total": 200, "covered": 157, "pct": 78.3 }
  }
}
```

### 2. HTML Export

```bash
/coverage-checker --export=html

# Output: coverage/index.html
# Opens interactive HTML report in browser
```

Features:
- 📊 Visual coverage graphs
- 🔍 File-by-file breakdown
- 📝 Source code view with coverage highlighting
- 🎯 Uncovered line indicators

### 3. LCOV Export

```bash
/coverage-checker --export=lcov

# Output: coverage/lcov.info
# Compatible with SonarQube, Codecov, Coveralls
```

### 4. Text Export

```bash
/coverage-checker --export=text

# Output: coverage/coverage.txt
# Plain text report for logs/CI
```

## Coverage Improvement Strategies

### 1. Identify Low Coverage Areas

```bash
# Find files below 80% coverage
/coverage-checker --threshold=80 --uncovered
```

### 2. Prioritize Critical Paths

Focus on:
- API interaction code
- Data processing logic
- Error handling
- User input validation

### 3. Add Missing Test Cases

```typescript
// Before: 50% branch coverage
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// Test only success case
it('should divide numbers', () => {
  expect(divide(10, 2)).toBe(5);
});

// After: 100% branch coverage
describe('divide', () => {
  it('should divide numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw error on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});
```

### 4. Test Edge Cases

```typescript
describe('apiQuotaManager', () => {
  // ✅ Test normal cases
  it('should handle normal query usage', () => {
    manager.recordQuery('test', 2);
    expect(manager.getRemainingQuota()).toBe(98);
  });

  // ✅ Test edge cases
  it('should handle zero queries', () => {
    manager.recordQuery('test', 0);
    expect(manager.getRemainingQuota()).toBe(100);
  });

  it('should handle quota exceeded', () => {
    manager.recordQuery('test', 101);
    expect(manager.isQuotaExceeded()).toBe(true);
  });

  it('should handle negative values gracefully', () => {
    expect(() => manager.recordQuery('test', -1)).toThrow();
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/coverage.yml
name: Coverage

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:coverage

      # Upload to Codecov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

      # Comment PR with coverage
      - uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Coverage Badges

### Generate Badge

```markdown
# README.md
![Coverage](https://img.shields.io/codecov/c/github/username/repo)
```

### Custom Badge

```bash
# Generate local badge
/coverage-checker --badge

# Output: coverage-badge.svg
```

## Troubleshooting

### Coverage Not Updating

```bash
# Clear coverage cache
rm -rf coverage/
pnpm test:coverage
```

### Incorrect Coverage Numbers

```bash
# Check for:
# 1. Files excluded in vitest.config.ts
# 2. Untested files not imported anywhere
# 3. TypeScript compilation errors
```

### Coverage Below Threshold in CI

```yaml
# Make coverage non-blocking temporarily
- run: pnpm test:coverage || true
```

## Best Practices

### 1. Regular Coverage Checks

```bash
# Check coverage before each commit
git commit hook:
#!/bin/bash
pnpm test:coverage
if [ $? -ne 0 ]; then
  echo "Coverage below threshold. Commit blocked."
  exit 1
fi
```

### 2. Incremental Coverage Goals

- Week 1: Reach 70%
- Week 2: Reach 75%
- Week 3: Reach 80%
- Week 4: Reach 85%

### 3. Coverage in Code Reviews

- ✅ Check coverage report in PRs
- ✅ Require tests for new features
- ✅ Don't merge if coverage decreases

### 4. Exclude Generated Files

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    'node_modules/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/dist/**',
    '**/coverage/**',
  ],
}
```

## Related Skills

- [test-runner](/test-runner) - Run tests with coverage
- [seo-analysis](/seo-analysis) - SEO analysis
- [quota-monitor](/quota-monitor) - API quota monitoring

## Summary

The Coverage Checker skill provides:

- ✅ **Detailed Reports**: File-by-file coverage breakdown
- ✅ **Multiple Formats**: JSON, HTML, LCOV, text exports
- ✅ **Trend Analysis**: Track coverage over time
- ✅ **Uncovered Lines**: Identify gaps in test coverage
- ✅ **CI/CD Integration**: Automated coverage checks
- ✅ **Threshold Alerts**: Ensure coverage goals are met

## Next Steps

1. [ ] Generate initial coverage report
2. [ ] Review uncovered lines
3. [ ] Add missing test cases
4. [ ] Set up coverage tracking
5. [ ] Integrate with CI/CD
6. [ ] Add coverage badge to README

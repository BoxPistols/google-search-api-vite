# SEO Analysis Skill

## Description

This skill performs comprehensive SEO analysis for keywords using Google Custom Search API.

## Usage

```bash
# Activate the skill
/seo-analysis <keyword>
```

## Examples

```bash
# Basic usage
/seo-analysis "React TypeScript"

# Multiple keywords
/seo-analysis "Next.js" "Vite" "Astro"

# With options
/seo-analysis "SEO tools" --depth=detailed --export=pdf
```

## Parameters

- `keyword` (required): The keyword to analyze
- `--depth`: Analysis depth (`basic` | `standard` | `detailed`)
  - `basic`: Top 10 results (1 query)
  - `standard`: Top 20 results (2 queries)
  - `detailed`: Top 40 results + metadata (4 queries)
- `--export`: Export format (`pdf` | `excel` | `json` | `markdown`)
- `--compare`: Compare with previous search results

## Workflow

1. **Search Execution**
   - Perform Google Custom Search
   - Track quota usage
   - Save results to history

2. **Analysis**
   - Domain distribution
   - Title/snippet analysis
   - Ranking patterns

3. **Report Generation**
   - Summary statistics
   - Top competitors
   - Recommendations

4. **Export**
   - Generate report in specified format
   - Save to local storage or cloud

## Output Example

```markdown
# SEO Analysis Report: React TypeScript

## Summary
- **Total Results**: 20
- **Queries Used**: 2
- **Date**: 2025-11-18

## Top 10 Rankings
1. React TypeScript Documentation (react.dev) - Rank: 1
2. TypeScript with React Tutorial (typescriptlang.org) - Rank: 2
3. React + TypeScript Cheatsheet (github.com) - Rank: 3
...

## Domain Analysis
| Domain | Count | Percentage |
|--------|-------|-----------|
| react.dev | 5 | 25% |
| typescriptlang.org | 3 | 15% |
| medium.com | 2 | 10% |

## Recommendations
1. Focus on official documentation quality
2. Increase tutorial content
3. Build authority in TypeScript community
```

## Dependencies

- Google Custom Search API
- MCP Server (google-search-ranking)
- Export utilities (jspdf, xlsx)

## Quota Management

This skill consumes API quotas based on depth:
- Basic: 1 query
- Standard: 2 queries
- Detailed: 4 queries

Always check quota before running:
```bash
# Check quota
/quota-status
```

## Error Handling

```typescript
try {
  const result = await runSEOAnalysis(keyword, options);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    console.error('Daily quota exceeded. Resets at midnight UTC.');
  } else if (error.code === 'RATE_LIMIT') {
    console.error('Rate limit exceeded. Please wait and retry.');
  } else {
    console.error('Analysis failed:', error.message);
  }
}
```

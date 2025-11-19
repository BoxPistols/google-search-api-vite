#!/usr/bin/env node

/**
 * Google Search Ranking Checker MCP Server
 *
 * This MCP server provides tools for:
 * - Performing Google Custom Search API queries
 * - Managing API quotas
 * - Tracking search history
 * - Generating ranking reports
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ID = process.env.GOOGLE_SEARCH_ID;

// In-memory quota tracking (production should use Firestore/Redis)
const quotaData = {
  date: new Date().toISOString().split('T')[0],
  queriesUsed: 0,
  searches: [],
};

/**
 * Perform Google Custom Search
 */
async function performGoogleSearch(query, start = 1) {
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_API_KEY);
  url.searchParams.set('cx', GOOGLE_SEARCH_ID);
  url.searchParams.set('q', query);
  url.searchParams.set('start', start.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google API Error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Check and update quota
 */
function updateQuota(queries) {
  const today = new Date().toISOString().split('T')[0];

  // Reset if new day
  if (quotaData.date !== today) {
    quotaData.date = today;
    quotaData.queriesUsed = 0;
    quotaData.searches = [];
  }

  quotaData.queriesUsed += queries;
}

/**
 * Get ranking for specific keyword
 */
async function getSearchRanking(query) {
  try {
    // Check quota (100 queries/day for free tier)
    if (quotaData.queriesUsed >= 100) {
      throw new Error('Daily quota exceeded. Resets at midnight UTC.');
    }

    // Fetch top 20 results (2 queries)
    const [page1, page2] = await Promise.all([
      performGoogleSearch(query, 1),
      performGoogleSearch(query, 11),
    ]);

    updateQuota(2);

    const results = [
      ...(page1.items || []),
      ...(page2.items || []),
    ];

    // Record search
    quotaData.searches.push({
      query,
      timestamp: new Date().toISOString(),
      queries: 2,
      resultCount: results.length,
    });

    return {
      query,
      totalResults: results.length,
      queriesUsed: 2,
      remainingQuota: 100 - quotaData.queriesUsed,
      results: results.map((item, index) => ({
        rank: index + 1,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      })),
    };
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Get quota information
 */
function getQuotaInfo() {
  return {
    date: quotaData.date,
    queriesUsed: quotaData.queriesUsed,
    remainingQueries: 100 - quotaData.queriesUsed,
    totalSearches: quotaData.searches.length,
    searches: quotaData.searches,
  };
}

/**
 * Analyze domain distribution
 */
function analyzeDomains(results) {
  const domainCounts = {};

  results.forEach(result => {
    const domain = result.displayLink || new URL(result.link).hostname;
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  return Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: ((count / results.length) * 100).toFixed(1) + '%',
    }));
}

// MCP Server Setup
const server = new Server(
  {
    name: 'google-search-ranking',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools = [
  {
    name: 'search_ranking',
    description: 'Search Google and get ranking results for a specific keyword (uses 2 API queries)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search keyword or phrase',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_quota',
    description: 'Get current API quota usage information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'analyze_domains',
    description: 'Analyze domain distribution from search results',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search keyword to analyze',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'estimate_cost',
    description: 'Estimate the cost for a given number of queries',
    inputSchema: {
      type: 'object',
      properties: {
        queries: {
          type: 'number',
          description: 'Number of queries to estimate',
        },
      },
      required: ['queries'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_ranking': {
        const result = await getSearchRanking(args.query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_quota': {
        const quota = getQuotaInfo();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(quota, null, 2),
            },
          ],
        };
      }

      case 'analyze_domains': {
        const searchResult = await getSearchRanking(args.query);
        const domainAnalysis = analyzeDomains(searchResult.results);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  query: args.query,
                  totalResults: searchResult.results.length,
                  domains: domainAnalysis,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'estimate_cost': {
        const freeQueries = 100;
        const paidQueries = Math.max(0, args.queries - freeQueries);
        const cost = paidQueries * 0.005;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalQueries: args.queries,
                  freeQueries: Math.min(args.queries, freeQueries),
                  paidQueries,
                  estimatedCost: `$${cost.toFixed(2)}`,
                  monthlyCost: `$${(cost * 30).toFixed(2)}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Google Search Ranking MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

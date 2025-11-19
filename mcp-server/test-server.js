#!/usr/bin/env node

/**
 * MCP Test Server
 *
 * Provides test execution capabilities through MCP protocol
 * Tools:
 * - run_tests: Execute test suite
 * - check_coverage: Get coverage report
 * - run_specific_test: Run individual test file
 * - get_test_status: Get current test status
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Test status tracking
const testStatus = {
  lastRun: null,
  lastResults: null,
  isRunning: false,
};

// Project root directory
const projectRoot = path.resolve(process.cwd(), '..');

/**
 * Execute test command
 */
async function runTests(options = {}) {
  if (testStatus.isRunning) {
    throw new Error('Tests are already running');
  }

  try {
    testStatus.isRunning = true;
    testStatus.lastRun = new Date().toISOString();

    const { testPath, coverage, ui, watch } = options;

    let command = 'cd .. && pnpm test:run';

    if (coverage) {
      command = 'cd .. && pnpm test:coverage';
    } else if (ui) {
      command = 'cd .. && pnpm test:ui';
    } else if (watch) {
      command = 'cd .. && pnpm test:watch';
    } else if (testPath) {
      command = `cd .. && pnpm vitest run ${testPath}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: __dirname,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    const results = {
      success: true,
      timestamp: testStatus.lastRun,
      stdout,
      stderr,
      command,
    };

    testStatus.lastResults = results;
    testStatus.isRunning = false;

    return results;
  } catch (error) {
    testStatus.isRunning = false;
    testStatus.lastResults = {
      success: false,
      timestamp: testStatus.lastRun,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
    throw error;
  }
}

/**
 * Get test coverage report
 */
async function getCoverageReport() {
  try {
    // Read coverage summary
    const coveragePath = path.join(projectRoot, 'coverage', 'coverage-summary.json');

    try {
      const coverageData = await fs.readFile(coveragePath, 'utf-8');
      const coverage = JSON.parse(coverageData);

      return {
        success: true,
        coverage: coverage.total,
        timestamp: new Date().toISOString(),
      };
    } catch (readError) {
      // Coverage file doesn't exist, run coverage first
      await runTests({ coverage: true });

      const coverageData = await fs.readFile(coveragePath, 'utf-8');
      const coverage = JSON.parse(coverageData);

      return {
        success: true,
        coverage: coverage.total,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get coverage report. Try running tests with coverage first.',
    };
  }
}

/**
 * List available test files
 */
async function listTestFiles() {
  try {
    const { stdout } = await execAsync('cd .. && find src -name "*.test.ts*" -o -name "*.spec.ts*"', {
      cwd: __dirname,
    });

    const files = stdout.trim().split('\n').filter(Boolean);

    return {
      success: true,
      testFiles: files,
      count: files.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      testFiles: [],
      count: 0,
    };
  }
}

/**
 * Get current test status
 */
function getTestStatus() {
  return {
    ...testStatus,
    projectRoot,
  };
}

// Create MCP server
const server = new Server(
  {
    name: 'google-search-test-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_tests',
        description: 'Execute the test suite. Can run all tests or specific test files.',
        inputSchema: {
          type: 'object',
          properties: {
            testPath: {
              type: 'string',
              description: 'Optional path to specific test file (e.g., "src/utils/apiQuotaManager.test.ts")',
            },
            coverage: {
              type: 'boolean',
              description: 'Run tests with coverage report',
              default: false,
            },
            ui: {
              type: 'boolean',
              description: 'Open Vitest UI',
              default: false,
            },
            watch: {
              type: 'boolean',
              description: 'Run tests in watch mode',
              default: false,
            },
          },
        },
      },
      {
        name: 'check_coverage',
        description: 'Get test coverage report. Shows line, branch, function, and statement coverage.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_test_files',
        description: 'List all available test files in the project.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_test_status',
        description: 'Get current test execution status and last results.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_tests': {
        const results = await runTests(args || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'check_coverage': {
        const coverage = await getCoverageReport();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(coverage, null, 2),
            },
          ],
        };
      }

      case 'list_test_files': {
        const files = await listTestFiles();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(files, null, 2),
            },
          ],
        };
      }

      case 'get_test_status': {
        const status = getTestStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
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
          text: JSON.stringify({
            success: false,
            error: error.message,
            stderr: error.stderr,
          }, null, 2),
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
  console.error('Google Search Test MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

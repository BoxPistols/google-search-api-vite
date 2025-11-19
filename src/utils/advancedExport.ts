// Advanced Export Utilities
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { SearchResult, SearchStats } from '../types/search';

// PDF Export with Japanese font support
export const exportToPDF = (results: SearchResult[], keyword: string) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Google Search Ranking Report', 14, 22);

  // Subtitle
  doc.setFontSize(12);
  doc.text(`Keyword: ${keyword}`, 14, 32);
  doc.text(`Generated: ${new Date().toLocaleString('ja-JP')}`, 14, 40);

  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Rank', 'Title', 'URL', 'Description']],
    body: results.map((result, index) => [
      String(index + 1),
      result.title,
      result.link,
      result.snippet,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [29, 109, 213],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 50 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 },
    },
  });

  // Save
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`search_ranking_${keyword}_${timestamp}.pdf`);
};

// Excel Export with multiple sheets
export const exportToExcel = (results: SearchResult[], keyword: string, stats?: SearchStats) => {
  const workbook = XLSX.utils.book_new();

  // Main results sheet
  const resultsData = results.map((result, index) => ({
    順位: index + 1,
    タイトル: result.title,
    URL: result.link,
    表示URL: result.displayLink || result.link,
    説明: result.snippet,
  }));

  const resultsSheet = XLSX.utils.json_to_sheet(resultsData);

  // Set column widths
  resultsSheet['!cols'] = [
    { wch: 6 }, // 順位
    { wch: 50 }, // タイトル
    { wch: 60 }, // URL
    { wch: 30 }, // 表示URL
    { wch: 60 }, // 説明
  ];

  XLSX.utils.book_append_sheet(workbook, resultsSheet, '検索結果');

  // Summary sheet
  const summaryData = [
    { 項目: 'キーワード', 値: keyword },
    { 項目: '検索日時', 値: new Date().toLocaleString('ja-JP') },
    { 項目: '結果件数', 値: results.length },
  ];

  if (stats) {
    summaryData.push(
      { 項目: '総検索回数', 値: stats.totalSearches },
      { 項目: '総クエリ消費', 値: stats.totalQueries }
    );
  }

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'サマリー');

  // Domain analysis sheet
  const domainCounts = results.reduce(
    (acc, result) => {
      const domain = result.displayLink || new URL(result.link).hostname;
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const domainData = Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([domain, count]) => ({
      ドメイン: domain,
      出現回数: count,
      割合: `${((count / results.length) * 100).toFixed(1)}%`,
    }));

  const domainSheet = XLSX.utils.json_to_sheet(domainData);
  XLSX.utils.book_append_sheet(workbook, domainSheet, 'ドメイン分析');

  // Save
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `search_ranking_${keyword}_${timestamp}.xlsx`);
};

// Markdown Export
export const exportToMarkdown = (results: SearchResult[], keyword: string): string => {
  let markdown = `# Google Search Ranking Report\n\n`;
  markdown += `**Keyword:** ${keyword}\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString('ja-JP')}\n\n`;
  markdown += `**Total Results:** ${results.length}\n\n`;
  markdown += `---\n\n`;
  markdown += `## Search Results\n\n`;

  results.forEach((result, index) => {
    markdown += `### ${index + 1}. ${result.title}\n\n`;
    markdown += `**URL:** [${result.displayLink || result.link}](${result.link})\n\n`;
    markdown += `**Description:** ${result.snippet}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

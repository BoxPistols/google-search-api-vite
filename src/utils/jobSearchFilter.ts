// src/utils/jobSearchFilter.ts
import type { SearchResult } from '../types/search';

/**
 * 求人サイト・人材紹介会社のブラックリスト
 * これらのドメインを含む結果は除外される
 */
const JOB_SITE_BLACKLIST = [
  // 大手求人サイト
  'indeed.com',
  'indeed.jp',
  'rikunabi.com',
  'mynavi.jp',
  'doda.jp',
  'doda.com',
  'en-japan.com',
  'type.jp',
  'bizreach.jp',
  'bizreach.com',
  'pasona.co.jp',
  'recruit.co.jp',
  'recruitagent.co.jp',
  'careerconnection.jp',
  'workport.co.jp',
  'careercross.com',
  'daijob.com',
  'jobs.jp',
  'jinzai-bank.com',
  'jaic-g.com',
  'uzuz.jp',
  'jac-recruitment.jp',
  'randstad.co.jp',
  'persol-career.co.jp',
  'rs-lab.jp',
  'r-agent.com',
  'miidas.jp',
  'openwork.jp',
  'vorkers.com',
  'wantedly.com', // ウォンテッドリーは微妙だが、求人プラットフォームなので除外
  'green-japan.com',

  // まとめサイト・メディア
  'note.com',
  'note.mu',
  'hatenablog.com',
  'hatena.ne.jp',
  'qiita.com',
  'zenn.dev',
  'medium.com',
  'ameblo.jp',
  'fc2.com',
  'livedoor.jp',
  'yahoo.co.jp',
  'goo.ne.jp',

  // 派遣・アルバイト系
  'baitoru.com',
  'townwork.net',
  'hatalike.jp',
  'jinzaibank.com',
  'staffservice.co.jp',
];

/**
 * 企業の直接採用ページと判定するURLパターン
 */
const DIRECT_HIRING_URL_PATTERNS = [
  /\/recruit\/?/i,
  /\/careers?\/?/i,
  /\/jobs?\/?/i,
  /\/採用\/?/,
  /\/employment\/?/i,
  /\/join\/?/i,
  /\/人材募集\/?/,
  /\/新卒採用\/?/,
  /\/中途採用\/?/,
  /\/キャリア\/?/,
  /hiring/i,
];

/**
 * ブログやまとめ記事と判定するURLパターン
 */
const BLOG_ARTICLE_PATTERNS = [
  /\/blog\//i,
  /\/article\//i,
  /\/post\//i,
  /\/entry\//i,
  /\/news\//i,
  /\/column\//i,
  /\/media\//i,
  /\/magazine\//i,
  /まとめ/,
];

/**
 * MetatagsからJobPosting構造化データを検知
 */
function detectJobPostingFromMetatags(result: SearchResult): boolean {
  const metatags = result.pagemap?.metatags?.[0];
  if (!metatags) return false;

  // og:typeがjob, article:section, または説明文に求人関連のキーワードが含まれる
  const ogType = metatags['og:type']?.toLowerCase() || '';
  const description = (metatags['og:description'] || metatags.description || '').toLowerCase();
  const title = (metatags['og:title'] || result.title).toLowerCase();

  // JobPostingを示すキーワード
  const jobKeywords = [
    '採用',
    '募集',
    'キャリア',
    '求人',
    '新卒',
    '中途',
    'career',
    'recruit',
    'hiring',
    'job opening',
    'employment',
  ];

  const hasJobKeywords =
    jobKeywords.some(keyword => title.includes(keyword)) ||
    jobKeywords.some(keyword => description.includes(keyword));

  return ogType.includes('job') || hasJobKeywords;
}

/**
 * 企業の直接採用ページかどうかを判定
 */
function isDirectHiringPage(url: string): boolean {
  return DIRECT_HIRING_URL_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * ブログやまとめ記事かどうかを判定
 */
function isBlogOrArticle(url: string, title: string, snippet: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();

  // URLパターンでチェック
  if (BLOG_ARTICLE_PATTERNS.some(pattern => pattern.test(url))) {
    return true;
  }

  // 「◯選」「まとめ」などのキーワード
  const summaryKeywords = ['まとめ', '選', '比較', 'ランキング', '一覧', 'おすすめ'];
  return summaryKeywords.some(
    keyword => lowerTitle.includes(keyword) || lowerSnippet.includes(keyword)
  );
}

/**
 * 求人サイト・人材紹介会社のドメインかどうかを判定
 */
function isJobSiteDomain(displayLink: string): boolean {
  const lowerDomain = displayLink.toLowerCase();
  return JOB_SITE_BLACKLIST.some(blacklistedDomain =>
    lowerDomain.includes(blacklistedDomain)
  );
}

/**
 * 検索結果に求人情報のメタデータを付与
 */
export function enrichJobPostingMetadata(result: SearchResult): SearchResult {
  const hasStructuredData = detectJobPostingFromMetatags(result);
  const isDirectHiring = isDirectHiringPage(result.link);

  // 企業の直接採用ページと判定
  const isJobPosting = hasStructuredData || isDirectHiring;

  // 企業名を抽出（displayLinkから推測）
  const companyName = result.displayLink.split('.')[0];

  return {
    ...result,
    isJobPosting,
    jobInfo: {
      hasStructuredData,
      isDirectHiring,
      companyName: isDirectHiring ? companyName : undefined,
    },
  };
}

/**
 * 求人検索モード用のフィルタリング
 * - 求人サイト・人材紹介会社を除外
 * - ブログ・まとめ記事を除外
 * - 企業の直接採用ページのみを残す
 */
export function filterJobSearchResults(results: SearchResult[]): SearchResult[] {
  return results
    .map(enrichJobPostingMetadata)
    .filter(result => {
      // 求人サイト・人材紹介会社を除外
      if (isJobSiteDomain(result.displayLink)) {
        console.log(`[Job Filter] 除外 (求人サイト): ${result.displayLink}`);
        return false;
      }

      // ブログ・まとめ記事を除外
      if (isBlogOrArticle(result.link, result.title, result.snippet)) {
        console.log(`[Job Filter] 除外 (ブログ/まとめ): ${result.link}`);
        return false;
      }

      // 企業の直接採用ページのみを残す
      if (!result.isJobPosting) {
        console.log(`[Job Filter] 除外 (求人ページではない): ${result.link}`);
        return false;
      }

      console.log(`[Job Filter] 採用: ${result.link}`);
      return true;
    });
}

/**
 * 求人検索結果を優先度順にソート
 * 1. 構造化データあり + 直接採用ページ
 * 2. 直接採用ページ
 * 3. その他
 */
export function sortJobSearchResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    const scoreA = calculateJobRelevanceScore(a);
    const scoreB = calculateJobRelevanceScore(b);
    return scoreB - scoreA;
  });
}

function calculateJobRelevanceScore(result: SearchResult): number {
  let score = 0;

  if (result.jobInfo?.hasStructuredData) score += 10;
  if (result.jobInfo?.isDirectHiring) score += 5;
  if (result.isJobPosting) score += 3;

  return score;
}

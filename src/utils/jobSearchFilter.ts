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

  // フリーランス・業務委託エージェント
  'prosheet.jp',
  'pro-sheet.com',
  'levtech.jp',
  'freelance.levtech.jp',
  'freelance-start.com',
  'itmatch.jp',
  'pe-bank.jp',
  'bigdata-navi.com',
  'freelancehub.jp',
  'crowdtech.jp',
  'workship.jp',
  'midworks.jp',
  'furien.jp',
  'techs-stock.com',
  'agent-network.com',
  'geechs-job.com',
  'forkwell.com',
  'freelance.sejuku.net',
  'techcareer-freelance.com',
  'paiza.jp',
  'findy-freelance.com',
  'freelance.potepan.com',
  'reworker.jp',
  'agent-on.com',
  'freelance-now.com',

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
 * フリーランス案件の詳細情報を抽出
 */
interface FreelanceJobInfo {
  isFreelance: boolean;
  workingDays?: number; // 週何日
  hourlyRate?: number; // 時給
  isRemote: boolean; // リモート可能か
  remoteType?: 'full' | 'partial' | 'none'; // リモートの種類
}

/**
 * 週の稼働日数を検出
 */
function detectWorkingDays(text: string): number | undefined {
  const lowerText = text.toLowerCase();

  // 週5、週4などのパターン
  const weekDayMatch = lowerText.match(/週([1-5])(?:日|回)?/);
  if (weekDayMatch) {
    return parseInt(weekDayMatch[1], 10);
  }

  // フルタイム、常勤の場合は週5とみなす
  if (lowerText.includes('フルタイム') || lowerText.includes('常勤') || lowerText.includes('正社員')) {
    return 5;
  }

  return undefined;
}

/**
 * 時給を検出（円、万円対応）
 */
function detectHourlyRate(text: string): number | undefined {
  const lowerText = text.toLowerCase();

  // 時給XXX円、時給XXX万円のパターン
  const hourlyRateMatch = lowerText.match(/時給\s*([0-9,]+)\s*(万?円|円)/);
  if (hourlyRateMatch) {
    const amount = parseInt(hourlyRateMatch[1].replace(/,/g, ''), 10);
    const unit = hourlyRateMatch[2];

    if (unit.includes('万')) {
      return amount * 10000;
    }
    return amount;
  }

  // 月額から時給を推定（月額 / 160時間）
  const monthlyRateMatch = lowerText.match(/月額\s*([0-9,]+)\s*(万?円|円)/);
  if (monthlyRateMatch) {
    const amount = parseInt(monthlyRateMatch[1].replace(/,/g, ''), 10);
    const unit = monthlyRateMatch[2];

    let monthlyRate = amount;
    if (unit.includes('万')) {
      monthlyRate = amount * 10000;
    }

    // 月額を160時間で割って時給を推定
    return Math.round(monthlyRate / 160);
  }

  return undefined;
}

/**
 * リモートワークの可否を検出
 */
function detectRemoteWork(text: string): { isRemote: boolean; remoteType: 'full' | 'partial' | 'none' } {
  const lowerText = text.toLowerCase();

  // フルリモートのキーワード
  if (
    lowerText.includes('フルリモート') ||
    lowerText.includes('完全リモート') ||
    lowerText.includes('full remote') ||
    lowerText.includes('フル在宅')
  ) {
    return { isRemote: true, remoteType: 'full' };
  }

  // リモート可（一部リモート）
  if (
    lowerText.includes('リモート可') ||
    lowerText.includes('リモートワーク可') ||
    lowerText.includes('在宅可') ||
    lowerText.includes('remote ok')
  ) {
    return { isRemote: true, remoteType: 'partial' };
  }

  // 常駐・出社必須のキーワード
  if (
    lowerText.includes('常駐') ||
    lowerText.includes('出社') ||
    lowerText.includes('オフィス勤務') ||
    lowerText.includes('客先常駐')
  ) {
    return { isRemote: false, remoteType: 'none' };
  }

  return { isRemote: false, remoteType: 'none' };
}

/**
 * フリーランス案件の情報を抽出
 */
function extractFreelanceJobInfo(result: SearchResult): FreelanceJobInfo {
  const combinedText = `${result.title} ${result.snippet}`.toLowerCase();

  const workingDays = detectWorkingDays(combinedText);
  const hourlyRate = detectHourlyRate(combinedText);
  const { isRemote, remoteType } = detectRemoteWork(combinedText);

  // フリーランス・業務委託のキーワード
  const isFreelance =
    combinedText.includes('フリーランス') ||
    combinedText.includes('業務委託') ||
    combinedText.includes('freelance') ||
    combinedText.includes('週3') ||
    combinedText.includes('週2') ||
    combinedText.includes('週1') ||
    combinedText.includes('時給');

  return {
    isFreelance,
    workingDays,
    hourlyRate,
    isRemote,
    remoteType,
  };
}

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

  // フリーランス案件情報を抽出
  const freelanceInfo = extractFreelanceJobInfo(result);

  return {
    ...result,
    isJobPosting,
    jobInfo: {
      hasStructuredData,
      isDirectHiring,
      companyName: isDirectHiring ? companyName : undefined,
    },
    freelanceInfo,
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
 * フリーランス案件専用のフィルタリング（動的設定対応）
 */
export function filterFreelanceJobResults(
  results: SearchResult[],
  settings: {
    maxWorkingDays: number;
    minHourlyRate: number;
    remoteType: 'full' | 'partial' | 'any';
    customBlocklist: string[];
  }
): SearchResult[] {
  return results
    .map(enrichJobPostingMetadata)
    .filter(result => {
      // 求人サイト・フリーランスエージェントを除外
      if (isJobSiteDomain(result.displayLink)) {
        console.log(`[Freelance Filter] 除外 (エージェント): ${result.displayLink}`);
        return false;
      }

      // カスタムブロックリストでチェック
      const lowerDomain = result.displayLink.toLowerCase();
      if (settings.customBlocklist.some(domain => lowerDomain.includes(domain.toLowerCase()))) {
        console.log(`[Freelance Filter] 除外 (カスタムブロックリスト): ${result.displayLink}`);
        return false;
      }

      // ブログ・まとめ記事を除外
      if (isBlogOrArticle(result.link, result.title, result.snippet)) {
        console.log(`[Freelance Filter] 除外 (ブログ/まとめ): ${result.link}`);
        return false;
      }

      const freelanceInfo = result.freelanceInfo;
      if (!freelanceInfo) {
        console.log(`[Freelance Filter] 除外 (フリーランス情報なし): ${result.link}`);
        return false;
      }

      // 週の稼働日数チェック
      if (freelanceInfo.workingDays && freelanceInfo.workingDays > settings.maxWorkingDays) {
        console.log(
          `[Freelance Filter] 除外 (週${freelanceInfo.workingDays}日 > ${settings.maxWorkingDays}日): ${result.link}`
        );
        return false;
      }

      // 時給チェック
      if (freelanceInfo.hourlyRate && freelanceInfo.hourlyRate < settings.minHourlyRate) {
        console.log(
          `[Freelance Filter] 除外 (時給${freelanceInfo.hourlyRate}円 < ${settings.minHourlyRate}円): ${result.link}`
        );
        return false;
      }

      // リモートタイプチェック
      if (settings.remoteType === 'full' && freelanceInfo.remoteType !== 'full') {
        console.log(
          `[Freelance Filter] 除外 (リモート: ${freelanceInfo.remoteType}, 必要: full): ${result.link}`
        );
        return false;
      }

      if (settings.remoteType === 'partial' && freelanceInfo.remoteType === 'none') {
        console.log(
          `[Freelance Filter] 除外 (リモート: ${freelanceInfo.remoteType}, 必要: partial以上): ${result.link}`
        );
        return false;
      }

      console.log(
        `[Freelance Filter] 採用 (週${freelanceInfo.workingDays || '?'}日, 時給${freelanceInfo.hourlyRate || '?'}円, ${freelanceInfo.remoteType}): ${result.link}`
      );
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

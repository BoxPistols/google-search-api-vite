// src/types/search.ts
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlSnippet: string;
  htmlTitle: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    cse_image?: Array<{
      src: string;
    }>;
    metatags?: Array<{
      'og:title'?: string;
      'og:description'?: string;
      'og:image'?: string;
      'og:url'?: string;
      'og:type'?: string;
      description?: string;
      keywords?: string;
      viewport?: string;
    }>;
  };
  // 求人情報の検知フラグ
  isJobPosting?: boolean;
  jobInfo?: {
    hasStructuredData: boolean;
    isDirectHiring: boolean;
    companyName?: string;
    jobTitle?: string;
    location?: string;
    salary?: string;
  };
  // フリーランス案件情報
  freelanceInfo?: {
    isFreelance: boolean;
    workingDays?: number; // 週何日
    hourlyRate?: number; // 時給
    isRemote: boolean; // リモート可能か
    remoteType?: 'full' | 'partial' | 'none'; // リモートの種類
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
  results: SearchResult[];
  queriesUsed: number;
}

export interface SearchStats {
  totalSearches: number;
  totalQueries: number;
  lastSearch?: string;
  searchHistory: SearchHistory[];
}

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

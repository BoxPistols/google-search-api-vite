// src/utils/localStorage.ts
import type { SearchHistory, SearchStats } from '../types/search';

const STORAGE_KEY = 'seo_search_history';
const MAX_HISTORY_ITEMS = 50;

export const saveSearchToHistory = (searchData: SearchHistory): void => {
  try {
    const stats = getSearchStats();
    const updatedHistory = [searchData, ...stats.searchHistory].slice(0, MAX_HISTORY_ITEMS);

    const updatedStats: SearchStats = {
      totalSearches: stats.totalSearches + 1,
      totalQueries: stats.totalQueries + searchData.queriesUsed,
      lastSearch: searchData.query,
      searchHistory: updatedHistory,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const getSearchStats = (): SearchStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading search history:', error);
  }

  return {
    totalSearches: 0,
    totalQueries: 0,
    searchHistory: [],
  };
};

export const getSearchHistory = (): SearchHistory[] => {
  return getSearchStats().searchHistory;
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

export const getSearchById = (id: string): SearchHistory | undefined => {
  const history = getSearchHistory();
  return history.find(item => item.id === id);
};

import { useState, useEffect, useCallback } from 'react';
import { handleAPIError } from '../services/api';

// Generic hook for API calls with loading state
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
};

// Hook for API calls that execute immediately
export const useApiEffect = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();
        setData(result);
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, refetch };
};

// Hook for mutations (POST, PUT, DELETE)
export const useMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { mutate, loading, error };
};

// Hook for paginated data
export const usePagination = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPage = useCallback(async (pageNum = 1, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction({
        ...initialParams,
        ...params,
        page: pageNum,
      });
      
      if (pageNum === 1) {
        setData(result.data || result);
      } else {
        setData(prev => [...prev, ...(result.data || result)]);
      }
      
      setPage(pageNum);
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalItems || 0);
      setHasMore(pageNum < (result.totalPages || 0));
      
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, initialParams]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      return fetchPage(page + 1);
    }
  }, [fetchPage, hasMore, loading, page]);

  const refresh = useCallback((params = {}) => {
    setData([]);
    setPage(1);
    setHasMore(true);
    return fetchPage(1, params);
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    hasMore,
    page,
    totalPages,
    totalItems,
    loadMore,
    refresh,
  };
};

// Hook for search functionality
export const useSearch = (apiFunction, debounceDelay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(searchQuery);
      setResults(result.data || result);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setResults([]);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, search, debounceDelay]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  };
};

// Hook for optimistic updates
export const useOptimisticUpdate = (apiFunction, updateFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (optimisticData, ...args) => {
    const previousData = data;
    
    try {
      setLoading(true);
      setError(null);
      
      // Apply optimistic update
      if (updateFunction) {
        setData(updateFunction(previousData, optimisticData));
      } else {
        setData(optimisticData);
      }
      
      // Make actual API call
      const result = await apiFunction(...args);
      setData(result);
      
      return result;
    } catch (err) {
      // Revert optimistic update on error
      setData(previousData);
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, updateFunction, data]);

  return { data, setData, loading, error, update };
};

// Hook for managing multiple API calls
export const useApiBundle = (apiCalls) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled(
        Object.entries(apiCalls).map(async ([key, apiCall]) => {
          const result = await apiCall();
          return [key, result];
        })
      );
      
      const successfulResults = {};
      const errors = {};
      
      results.forEach((result, index) => {
        const [key] = Object.entries(apiCalls)[index];
        
        if (result.status === 'fulfilled') {
          successfulResults[key] = result.value[1];
        } else {
          errors[key] = handleAPIError(result.reason);
        }
      });
      
      setData(successfulResults);
      
      if (Object.keys(errors).length > 0) {
        setError(errors);
      }
      
      return { data: successfulResults, errors };
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCalls]);

  return { data, loading, error, execute };
};

// Hook for caching API responses
export const useApiCache = (apiFunction, cacheKey, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCachedData = useCallback(() => {
    const cached = localStorage.getItem(`api_cache_${cacheKey}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    return null;
  }, [cacheKey, ttl]);

  const setCachedData = useCallback((data) => {
    localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, [cacheKey]);

  const execute = useCallback(async (...args) => {
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      return cachedData;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, getCachedData, setCachedData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`api_cache_${cacheKey}`);
  }, [cacheKey]);

  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
    }
  }, [getCachedData]);

  return { data, loading, error, execute, clearCache };
};

export default {
  useApi,
  useApiEffect,
  useMutation,
  usePagination,
  useSearch,
  useOptimisticUpdate,
  useApiBundle,
  useApiCache,
};

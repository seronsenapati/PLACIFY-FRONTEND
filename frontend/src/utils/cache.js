// Cache utility with session storage and expiration
const CACHE_PREFIX = 'placify_cache_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate a cache key based on endpoint and parameters
 * @param {string} endpoint - API endpoint
 * @param {object} params - Request parameters
 * @returns {string} - Generated cache key
 */
export function generateCacheKey(endpoint, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
  
  const paramStr = JSON.stringify(sortedParams);
  return `${CACHE_PREFIX}${endpoint}_${btoa(paramStr)}`;
}

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not available/expired
 */
export function getCachedData(key) {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp, expiration } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache has expired
    if (now - timestamp > expiration) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Set data in cache with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiration - Expiration time in milliseconds
 */
export function setCachedData(key, data, expiration = DEFAULT_CACHE_DURATION) {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expiration
    };
    sessionStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Clear cache for specific key
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Invalidate cache for keys matching a pattern
 * @param {string} pattern - Pattern to match cache keys
 */
export function invalidateCachePattern(pattern) {
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error invalidating cache pattern:', error);
  }
}

/**
 * Wrapper for API calls with caching
 * @param {Function} apiCall - API call function
 * @param {string} endpoint - API endpoint for cache key
 * @param {object} params - API call parameters
 * @param {object} options - Cache options
 * @returns {Promise<any>} - API response data
 */
export async function cachedApiCall(apiCall, endpoint, params = {}, options = {}) {
  const {
    useCache = true,
    cacheDuration = DEFAULT_CACHE_DURATION,
    skipCache = false,
    // Add option to show cached data immediately while fetching fresh data
    showCachedImmediately = false
  } = options;
  
  // Skip cache if explicitly requested
  if (!useCache || skipCache) {
    return await apiCall();
  }
  
  const cacheKey = generateCacheKey(endpoint, params);
  
  // Try to get from cache first
  if (useCache) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData !== null) {
      console.log(`[Cache] Hit for ${endpoint}`);
      
      // If showCachedImmediately is true, return cached data immediately
      // and fetch fresh data in the background to update the cache
      if (showCachedImmediately) {
        // Don't await this - fetch in background
        apiCall()
          .then(freshData => {
            // Update cache with fresh data
            setCachedData(cacheKey, freshData, cacheDuration);
            console.log(`[Cache] Fresh data updated for ${endpoint}`);
          })
          .catch(error => {
            console.error(`[Cache] Error fetching fresh data for ${endpoint}:`, error);
          });
        
        // Return cached data immediately
        return cachedData;
      }
      
      // Otherwise, return cached data and fetch fresh data normally
      return cachedData;
    }
    console.log(`[Cache] Miss for ${endpoint}`);
  }
  
  // Fetch fresh data
  const data = await apiCall();
  
  // Cache the result
  if (useCache) {
    setCachedData(cacheKey, data, cacheDuration);
  }
  
  return data;
}

/**
 * Invalidate cache on data mutations
 * @param {string} method - HTTP method (POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 */
export function handleCacheInvalidation(method, endpoint) {
  // Only invalidate on mutations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    return;
  }
  
  console.log(`[Cache] Invalidating cache for ${method} ${endpoint}`);
  
  // Invalidate specific patterns based on endpoint
  if (endpoint.includes('/applications')) {
    invalidateCachePattern('/applications');
  } else if (endpoint.includes('/jobs')) {
    invalidateCachePattern('/jobs');
  } else if (endpoint.includes('/profile')) {
    invalidateCachePattern('/profile');
  } else {
    // For other mutations, clear all cache to be safe
    clearAllCache();
  }
}

export default {
  generateCacheKey,
  getCachedData,
  setCachedData,
  clearCache,
  clearAllCache,
  invalidateCachePattern,
  cachedApiCall,
  handleCacheInvalidation
};
// Central auth helpers
export function setAuthData(token, role, name, userId) {
  // Validate inputs
  if (!token || !role) {
    throw new Error('Token and role are required');
  }
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role?.toLowerCase()); // ensure lowercase role
    if (name) localStorage.setItem('name', name);
    if (userId) localStorage.setItem('userId', userId);
  } catch (error) {
    console.error('Error setting auth data:', error);
    throw new Error('Failed to set authentication data');
  }
}

export function isLoggedIn() {
  try {
    // Check both token and role exist
    return !!(localStorage.getItem('token') && localStorage.getItem('role'));
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}

export function getRole() {
  try {
    return localStorage.getItem('role');
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
}

export function hasRole(requiredRole) {
  if (!requiredRole) {
    console.error('Role is required for role checking');
    return false;
  }
  
  try {
    const userRole = localStorage.getItem('role');
    return userRole === requiredRole.toLowerCase();
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

export function isAuthenticatedWithRole(requiredRole) {
  // First check if user is logged in
  if (!isLoggedIn()) {
    return false;
  }
  
  // If no specific role required, just being logged in is enough
  if (!requiredRole) {
    return true;
  }
  
  // Check if user has the required role
  return hasRole(requiredRole);
}

export function getName() {
  try {
    return localStorage.getItem('name') || '';
  } catch (error) {
    console.error('Error getting name:', error);
    return '';
  }
}

export function getUserId() {
  try {
    return localStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Rate limiting utilities
export function setRateLimitData(endpoint, retryAfter = 30) {
  if (!endpoint) {
    console.error('Endpoint is required for rate limiting');
    return;
  }
  
  // Validate retryAfter is a positive number
  if (typeof retryAfter !== 'number' || retryAfter <= 0) {
    console.error('retryAfter must be a positive number');
    return;
  }
  
  try {
    const rateLimitKey = `rate_limit_${endpoint}`;
    const expiryTime = Date.now() + (retryAfter * 1000);
    localStorage.setItem(rateLimitKey, expiryTime.toString());
  } catch (error) {
    console.error('Error setting rate limit data:', error);
  }
}

export function getRateLimitData(endpoint) {
  if (!endpoint) {
    console.error('Endpoint is required for rate limiting');
    return null;
  }
  
  try {
    const rateLimitKey = `rate_limit_${endpoint}`;
    const expiryTime = localStorage.getItem(rateLimitKey);
    
    if (!expiryTime) return null;
    
    const now = Date.now();
    const expiry = parseInt(expiryTime);
    
    // Check if parsing was successful
    if (isNaN(expiry)) {
      localStorage.removeItem(rateLimitKey);
      return null;
    }
    
    if (now >= expiry) {
      localStorage.removeItem(rateLimitKey);
      return null;
    }
    
    return {
      remainingTime: Math.ceil((expiry - now) / 1000),
      expiryTime: expiry
    };
  } catch (error) {
    console.error('Error getting rate limit data for endpoint', endpoint, ':', error);
    return null;
  }
}

export function clearRateLimitData(endpoint) {
  if (!endpoint) {
    console.error('Endpoint is required for rate limiting');
    return;
  }
  
  try {
    const rateLimitKey = `rate_limit_${endpoint}`;
    localStorage.removeItem(rateLimitKey);
  } catch (error) {
    console.error('Error clearing rate limit data:', error);
  }
}

// Utility to clear all rate limit data for development
export function clearAllRateLimitData() {
  try {
    // Clear all localStorage items that start with 'rate_limit_'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rate_limit_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('All rate limit data cleared');
  } catch (error) {
    console.error('Error clearing all rate limit data:', error);
  }
}

export function refreshToken(newToken) {
  if (!newToken) {
    console.error('New token is required for refresh');
    return false;
  }
  
  try {
    localStorage.setItem('token', newToken);
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

export function isTokenExpired() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true; // No token means expired/invalid
    
    // If your JWT tokens contain expiration info, you can decode and check
    // For now, we'll just check if token exists
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't check
  }
}
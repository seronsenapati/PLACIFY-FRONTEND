// Central auth helpers
export function setAuthData(token, role, name) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role?.toLowerCase()); // ensure lowercase role
  if (name) localStorage.setItem('name', name);
}

export function isLoggedIn() {
  // Check both token and role exist
  return !!(localStorage.getItem('token') && localStorage.getItem('role'));
}

export function getRole() {
  return localStorage.getItem('role');
}

export function getName() {
  return localStorage.getItem('name') || '';
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
}

// Rate limiting utilities
export function setRateLimitData(endpoint, retryAfter = 60) {
  const rateLimitKey = `rate_limit_${endpoint}`;
  const expiryTime = Date.now() + (retryAfter * 1000);
  localStorage.setItem(rateLimitKey, expiryTime.toString());
}

export function getRateLimitData(endpoint) {
  const rateLimitKey = `rate_limit_${endpoint}`;
  const expiryTime = localStorage.getItem(rateLimitKey);
  
  if (!expiryTime) return null;
  
  const now = Date.now();
  const expiry = parseInt(expiryTime);
  
  if (now >= expiry) {
    localStorage.removeItem(rateLimitKey);
    return null;
  }
  
  return {
    remainingTime: Math.ceil((expiry - now) / 1000),
    expiryTime: expiry
  };
}

export function clearRateLimitData(endpoint) {
  const rateLimitKey = `rate_limit_${endpoint}`;
  localStorage.removeItem(rateLimitKey);
}

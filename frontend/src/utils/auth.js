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

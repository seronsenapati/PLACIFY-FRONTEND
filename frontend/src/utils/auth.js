// Central auth helpers
export function setAuthData(token, role) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
}
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
export function getRole() {
  return localStorage.getItem('role');
}
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

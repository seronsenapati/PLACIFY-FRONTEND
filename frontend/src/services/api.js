import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: '/api', // Use relative path to leverage Vite proxy
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to include auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If data is FormData, let the browser set the Content-Type with proper boundary
    if (config.data instanceof FormData) {
      // Delete Content-Type header so browser can set it with correct boundary
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      // Only set default Content-Type for non-FormData requests
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access denied');
          // Don't automatically redirect for 403, let the component handle it
          break;
        case 404:
          console.error('Requested resource not found');
          break;
        case 429:
          console.error('Too many requests - rate limited');
          // Don't redirect for rate limiting, let the component handle it
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
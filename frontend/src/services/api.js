import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: '/api', // Use relative path to leverage Vite proxy
  timeout: 30000, // Increase timeout to 30 seconds for better reliability
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
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - attempting retry with exponential backoff');
      
      // Show user-friendly message
      // In a real app, you might want to use a toast notification or similar
      console.warn('The request is taking longer than expected. Please check your internet connection.');
      
      // Implement exponential backoff retry
      if (!originalRequest.retryCount) {
        originalRequest.retryCount = 0;
      }
      
      if (originalRequest.retryCount < 2) { // Reduced retry attempts to 2
        originalRequest.retryCount++;
        // Exponential backoff: 2s, 4s
        const delay = Math.pow(2, originalRequest.retryCount) * 1000;
        console.log(`Retrying in ${delay/1000} seconds... (Attempt ${originalRequest.retryCount}/2)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      } else {
        console.error('Max retry attempts reached for timeout');
        return Promise.reject(new Error('The server is taking too long to respond. Please try again later or check your internet connection.'));
      }
    }
    
    // Handle network offline errors
    if (!error.response && !error.request) {
      console.error('Network error - check connection');
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }
    
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Skip automatic redirect for login requests
          // The login page should handle 401 errors itself
          if (originalRequest.url.includes('/auth/login')) {
            // Let the login component handle this error
            return Promise.reject(error);
          } else {
            // Handle unauthorized access for other requests
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access denied');
          return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
        case 404:
          console.error('Requested resource not found');
          return Promise.reject(new Error('Requested resource not found.'));
        case 429:
          console.error('Too many requests - rate limited');
          return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'));
        case 500:
          console.error('Server error');
          return Promise.reject(new Error('Server error. Please try again later.'));
        default:
          console.error(`An error occurred with status ${error.response.status}`);
          return Promise.reject(new Error(`An error occurred (status ${error.response.status}). Please try again.`));
      }
    } else if (error.request) {
      console.error('No response received from server');
      return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection and try again.'));
    } else {
      console.error('Error setting up request:', error.message);
      return Promise.reject(new Error('An unexpected error occurred. Please try again.'));
    }
  }
);

export default api;
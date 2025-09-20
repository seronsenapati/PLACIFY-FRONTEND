import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: '/api', // Use relative path to leverage Vite proxy
  timeout: 15000, // Increase timeout to 15 seconds
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
      // Implement exponential backoff retry
      if (!originalRequest.retryCount) {
        originalRequest.retryCount = 0;
      }
      
      if (originalRequest.retryCount < 3) {
        originalRequest.retryCount++;
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, originalRequest.retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      } else {
        console.error('Max retry attempts reached for timeout');
        return Promise.reject(new Error('Request timeout after multiple attempts'));
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
          // Bypass rate limiting for development - don't retry
          // For development, we'll let the calling component handle the 429 error
          console.log("Rate limiting bypassed for development");
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`An error occurred with status ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('No response received from server');
      return Promise.reject(new Error('No response received from server. Please check your connection.'));
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
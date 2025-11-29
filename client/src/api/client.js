import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to handle offline scenarios
api.interceptors.request.use(
  (config) => {
    // Add a timestamp to track when the request was made
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response, request } = error;
    const errorData = {
      config,
      status: response?.status,
      statusText: response?.statusText,
      url: config?.url,
      method: config?.method,
      timestamp: config?.metadata?.startTime,
      responseTime: config?.metadata?.startTime ? 
        new Date() - config.metadata.startTime : null
    };

    // Handle network errors (no response from server)
    if (!response) {
      // Don't log out for network errors - we'll handle this in the UI
      console.error('Network Error:', error.message);
      
      // For GET requests to auth endpoints, we'll let the request fail
      // so the UI can handle the offline state appropriately
      if (config?.url?.includes('/auth/') && config?.method?.toLowerCase() === 'get') {
        return Promise.reject({
          ...error,
          isNetworkError: true,
          message: 'Unable to connect to the server. Please check your internet connection.'
        });
      }
      
      // For other requests, reject with a more descriptive error
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your internet connection.'
      });
    }

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Only dispatch unauthorized event for auth-related endpoints
      if (config?.url?.includes('/auth/')) {
        document.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: {
            status: response.status,
            url: config.url,
            method: config.method
          }
        }));
      }
      
      // Return a more descriptive error
      return Promise.reject({
        ...error,
        isAuthError: true,
        message: response.data?.error || 'Your session has expired. Please log in again.'
      });
    }

    // Handle other error statuses
    const errorMessage = response.data?.error || 
                        response.statusText || 
                        'An error occurred. Please try again.';
    
    console.error(`API Error [${response.status}]:`, {
      ...errorData,
      error: errorMessage
    });

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: response.status
    });
  }
);

// Helper function to check if an error is a network error
api.isNetworkError = (error) => {
  return error.isNetworkError === true || 
         (error.request && !error.response) ||
         error.message?.includes('Network Error') ||
         error.message?.includes('timeout') ||
         error.code === 'ECONNABORTED';
};

// Helper function to check if an error is an auth error
api.isAuthError = (error) => {
  return error.isAuthError === true || 
         error.response?.status === 401 ||
         error.message?.toLowerCase().includes('unauthorized') ||
         error.message?.toLowerCase().includes('session expired');
};

export default api;

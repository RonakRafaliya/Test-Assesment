import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_app_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling with user-friendly messages
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Extract validation errors if present
      if (data?.errors) {
        // Validation errors - preserve the structure for form handling
        error.validationErrors = data.errors;
        error.message = data.message || 'Validation failed';
      } else if (data?.message) {
        // General error message
        error.message = data.message;
      } else {
        // Fallback messages based on status
        switch (status) {
          case 400:
            error.message = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            error.message = 'Authentication required. Please log in.';
            break;
          case 403:
            error.message = 'You do not have permission to perform this action.';
            break;
          case 404:
            error.message = 'The requested resource was not found.';
            break;
          case 500:
            error.message = 'Server error. Please try again later.';
            break;
          default:
            error.message = 'An error occurred. Please try again.';
        }
      }

      console.error('API Error:', status, data);
    } else if (error.request) {
      // Request was made but no response received (network error, CORS, etc.)
      error.message = 'Network error. Please check your internet connection and ensure the server is running.';
      console.error('Network Error:', error.message);
      console.error('Make sure the backend is running on', API_BASE_URL);
    } else {
      // Something else happened
      error.message = error.message || 'An unexpected error occurred. Please try again.';
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);


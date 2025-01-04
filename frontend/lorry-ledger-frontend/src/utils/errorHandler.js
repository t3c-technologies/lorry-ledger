/* =========================
   File: errorHandler.js
   Purpose: Centralized Error Handling
========================= */

export const handleApiError = (error) => {
    if (error.response) {
      // Server responded with a status code out of the range of 2xx
      console.error('API Error:', error.response.data);
      return {
        success: false,
        status: error.response.status,
        message: error.response.data.message || 'Something went wrong!',
      };
    } else if (error.request) {
      // No response was received after the request was made
      console.error('Network Error:', error.request);
      return {
        success: false,
        status: 0,
        message: 'Network error. Please try again.',
      };
    } else {
      // Something happened while setting up the request
      console.error('Error:', error.message);
      return {
        success: false,
        status: 0,
        message: error.message,
      };
    }
  };
  
  export const handleValidationError = (errors) => {
    const validationErrors = {};
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach((key) => {
        validationErrors[key] = errors[key].join(', ');
      });
    }
    return validationErrors;
  };
  
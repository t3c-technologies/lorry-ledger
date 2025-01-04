/* =========================
   File: errorHandler.js
   Purpose: Centralized Error Handling
========================= */

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code out of the range of 2xx
    console.error('API Error:', error.response.data);

    const message = error.response.data.message || 'Something went wrong!';
    const errors = error.response.data.errors || null; // Capture field-specific errors if present

    return {
      success: false,
      status: error.response.status,
      message,
      errors, // Include specific validation errors if available
    };
  } else if (error.request) {
    // No response was received after the request was made
    console.error('Network Error:', error.request);
    return {
      success: false,
      status: 0,
      message: 'Network error. Please check your internet connection and try again.',
    };
  } else {
    // Something happened while setting up the request
    console.error('Error:', error.message);
    return {
      success: false,
      status: 0,
      message: error.message || 'An unexpected error occurred.',
    };
  }
};

export const handleValidationError = (errors) => {
  const validationErrors = {};
  if (errors && typeof errors === 'object') {
    Object.keys(errors).forEach((key) => {
      validationErrors[key] = Array.isArray(errors[key])
        ? errors[key].join(', ') // Join array of errors into a single string
        : errors[key]; // Directly return the error if it's not an array
    });
  }
  return validationErrors;
};

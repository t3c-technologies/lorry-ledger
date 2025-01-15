/* =========================
   File: auth.js
   Purpose: Authentication Handling
========================= */

'use client';

// Login
export const login = async (api, endpoint, username, password) => {
  try {
    // Send login request to the server
    const response = await api.post(
      endpoint,
      { username, password },
      {
        withCredentials: true, // Ensure the backend can set HttpOnly cookies
      }
    );

    // Assuming the server sets the accessToken as an HttpOnly cookie
    if (response.status === 200) {
      console.log('Login successful!');
      return response.data; // Return data if the server provides any additional information
    } else {
      throw new Error('Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout
export const logout = async (api, endpoint) => {
  try {
    // Inform the backend to clear cookies
    await api.post(
      endpoint,
      {},
      {
        withCredentials: true, // Include cookies in the request
      }
    );

    // Redirect to login page after logout
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check Authentication Status
export const isAuthenticated = async (api, endpoint) => {
  try {
    // Make a request to the server to verify authentication
    const response = await api.get(endpoint, {
      withCredentials: true, // Include cookies in the request
    });

    return response.status === 200; // If 200, the user is authenticated
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};

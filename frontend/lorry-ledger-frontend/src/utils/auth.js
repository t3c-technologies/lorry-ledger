/* =========================
   File: auth.js
   Purpose: Authentication Handling
========================= */

'use client';

let accessToken = null;

// Set Access Token
export const setAccessToken = (token) => {
  accessToken = token;
};

// Get Access Token
export const getAccessToken = () => accessToken;

// Login
export const login = async (api, endpoint, username, password) => {
  try {
    const response = await api.post(endpoint, { username, password });
    if (response.access) {
      setAccessToken(response.access);
      localStorage.setItem('refreshToken', response.refresh);
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout
export const logout = async (api, endpoint) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post(endpoint, { refresh_token: refreshToken });
    accessToken = null;
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/* =========================
   File: api.js
   Purpose: Base API configuration
========================= */

'use client';

import axios from 'axios';
import { handleApiError } from './errorHandler';
import { getApiUrl } from './endpoints';
import { getAccessToken, setAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent for HttpOnly tokens
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post('auth/refresh/');
        setAccessToken(res.data.access);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Token refresh failed', err);
      }
    }
    return Promise.reject(handleApiError(error));
  }
);

export const api = {
  get: async (endpoint, params = {}) => {
    const response = await axiosInstance.get(getApiUrl(endpoint), { params });
    return response.data;
  },
  post: async (endpoint, data) => {
    const response = await axiosInstance.post(getApiUrl(endpoint), data);
    return response.data;
  },
  put: async (endpoint, data) => {
    const response = await axiosInstance.put(getApiUrl(endpoint), data);
    return response.data;
  },
  delete: async (endpoint) => {
    const response = await axiosInstance.delete(getApiUrl(endpoint));
    return response.data;
  },
};

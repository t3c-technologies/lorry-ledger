/* =========================
   File: endpoints.js
   Purpose: API Endpoint Definitions
========================= */

const API_VERSION = 'v1';

export const API_ENDPOINTS = {
  auth: {
    generate: `auth/generate/`,
    validate: `auth/validate/`,
    logout: `auth/logout/`,
    refresh: `auth/refresh/`,
    verify: `auth/verify/`,
  },
  user: {
    profile: `user/profile/`,
    updateProfile: `user/update/`,
  },
  drivers: {
    list: `drivers/`,                  
    create: `drivers/create/`,         
    detail: (id) => `drivers/${id}/`,  
    update: (id) => `drivers/${id}/update/`, 
    delete: (id) => `drivers/${id}/delete/`,
  },
};

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/api')) {
    return endpoint; // Avoid prefixing if already complete
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `/${cleanEndpoint}`;
};


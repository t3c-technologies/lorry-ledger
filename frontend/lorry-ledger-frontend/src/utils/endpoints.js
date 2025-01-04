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
    checkSession: `auth/checkSession/`,
  },
  user: {
    profile: `user/profile/`,
    updateProfile: `user/update/`,
  },
  vehicles: {
    list: `vehicles/list/`,
    create: `vehicles/create/`,
    update: `vehicles/update/`,
    delete: `vehicles/delete/`,
  },
  drivers: {
    list: `drivers/list/`,
    create: `drivers/create/`,
    update: `drivers/update/`,
    delete: `drivers/delete/`,
  },
};

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/api')) {
    return endpoint; // Avoid prefixing if already complete
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `/${cleanEndpoint}`;
};


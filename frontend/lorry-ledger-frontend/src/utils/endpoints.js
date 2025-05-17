/* =========================
   File: endpoints.js
   Purpose: API Endpoint Definitions
========================= */

const API_VERSION = "v1";

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
    transactions: (driverId) => `drivers/${driverId}/transactions`,
    transactionsCreate: (driverId) => `drivers/${driverId}/transactions/create`,
    transactionsUpdate: (id) => `drivers/transactions/${id}/update`,
    transactionsDelete: (id) => `drivers/transactions/${id}/delete`,
  },
  trucks: {
    list: `trucks/`,
    create: `trucks/create/`,
    detail: (id) => `trucks/${id}/`,
    update: (id) => `trucks/${id}/update/`,
    delete: (id) => `trucks/${id}/delete/`,
    expenses: (truckId) => `trucks/${truckId}/expenses`,
    expensesCreate: (truckId) => `trucks/${truckId}/expenses/create`,
    expensesUpdate: (id) => `trucks/expenses/${id}/update`,
    expensesDelete: (id) => `trucks/expenses/${id}/delete`,
  },

  parties: {
    list: `parties/`,
    create: `parties/create/`,
    detail: (id) => `parties/${id}/`,
    update: (id) => `parties/${id}/update/`,
    delete: (id) => `parties/${id}/delete/`,
  },

  suppliers: {
    list: `suppliers/`,
    create: `suppliers/create/`,
    detail: (id) => `suppliers/${id}/`,
    update: (id) => `suppliers/${id}/update/`,
    delete: (id) => `suppliers/${id}/delete/`,
  },

  trips: {
    list: `trips/`,
    create: `trips/create/`,
    detail: (id) => `trips/${id}/`,
    update: (id) => `trips/${id}/update/`,
    delete: (id) => `trips/${id}/delete/`,
  },

  consigners: {
    list: `consigners/`,
    create: `consigners/create/`,
  },

  consignees: {
    list: `consignees/`,
    create: `consignees/create/`,
  },

  LR: {
    listAll: `LR/`,
    list: (tripId) => `${tripId}/LR/`,
    create: `LR/create/`,
    update: (id) => `LR/${id}/update/`,
    delete: (id) => `LR/${id}/delete/`,
    print: (id) => `lr/pdf/${id}/`,
  },

  invoices: {
    listAll: `invoices/`,
    list: (tripId) => `${tripId}/invoices/`,
    create: `invoices/create/`,
    update: (id) => `invoices/${id}/update/`,
    delete: (id) => `invoices/${id}/delete/`,
  },
};

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith("/api")) {
    return endpoint; // Avoid prefixing if already complete
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `/${cleanEndpoint}`;
};

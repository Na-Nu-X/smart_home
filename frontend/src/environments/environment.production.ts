/**
 * Production environment – the API is expected to be served from the same
 * origin (reverse proxy `/api` -> Django). Change if the API lives elsewhere.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    CALLBACK: '/auth/callback',
    LOGOUT: '/auth/logout',
  },
  USER: '/user',
  GROUPS: '/groups',
  REPOSITORIES: '/repositories',
  WORKFLOW: {
    VALIDATE: '/workflow/validate',
    SUBMIT: '/workflow/submit',
    STATUS: '/workflow/status',
  },
} as const;
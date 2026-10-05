// Central API configuration for local and cloud environments
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getAuthToken = (): string => {
  return localStorage.getItem('campus_ai_token') || '';
};

export const setAuthToken = (token: string): void => {
  if (token) {
    localStorage.setItem('campus_ai_token', token);
  } else {
    localStorage.removeItem('campus_ai_token');
  }
};

export const getAuthHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

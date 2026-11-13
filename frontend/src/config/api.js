function normalizeBaseUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = String(rawUrl).trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function resolveApiUrl() {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
}

function resolveSocketUrl() {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL);
  if (envUrl) {
    return envUrl;
  }
  if (import.meta.env.PROD) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  return 'http://localhost:5000';
}

export const API_URL = resolveApiUrl();
export const SOCKET_URL = resolveSocketUrl();

export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const authToken = token || localStorage.getItem('royal_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Yêu cầu không thành công');
  }

  return data;
}


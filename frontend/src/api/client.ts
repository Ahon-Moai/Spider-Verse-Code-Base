import { ApiResponse } from './types';

// Read API base URL from Vite environment, fallback to relative '/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  public status?: number;
  public errors?: string[] | null;

  constructor(message: string, status?: number, errors?: string[] | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Universal typed request wrapper for all REST endpoints
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      err?.message || 'Network connection error. Check your internet connection or backend status.',
      0
    );
  }

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`Invalid server response from ${endpoint} (Status ${response.status})`, response.status);
  }

  if (!response.ok || payload.success === false) {
    const errorMsg = payload.error || payload.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, payload.errors);
  }

  return payload.data;
}

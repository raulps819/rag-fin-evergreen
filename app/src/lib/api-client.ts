/**
 * API Client for backend communication
 *
 * Centralized HTTP client with:
 * - Base URL configuration
 * - Default headers
 * - Error handling
 * - Timeouts
 * - TypeScript types
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request configuration
 */
interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string>;
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError('Request timeout', 408));
    }, timeoutMs);
  });
}

/**
 * Builds URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(endpoint, API_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

/**
 * Main API client function
 */
async function apiClient<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    timeout = API_TIMEOUT,
    params,
    headers = {},
    ...fetchConfig
  } = config;

  const url = buildUrl(endpoint, params);

  // Default headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Create fetch promise
  const fetchPromise = fetch(url, {
    ...fetchConfig,
    headers: defaultHeaders,
  });

  // Race between fetch and timeout
  const response = await Promise.race([
    fetchPromise,
    createTimeoutPromise(timeout),
  ]);

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData;

    try {
      errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use default message
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON response
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('Invalid JSON response', 500);
  }
}

/**
 * HTTP Methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(endpoint: string, config?: RequestConfig) =>
    apiClient<T>(endpoint, { ...config, method: 'GET' }),

  /**
   * POST request
   */
  post: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT request
   */
  put: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * PATCH request
   */
  patch: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE request
   */
  delete: <T = any>(endpoint: string, config?: RequestConfig) =>
    apiClient<T>(endpoint, { ...config, method: 'DELETE' }),

  /**
   * Upload file with FormData (no JSON content-type)
   */
  upload: <T = any>(endpoint: string, formData: FormData, config?: RequestConfig) => {
    const { headers, ...restConfig } = config || {};

    return apiClient<T>(endpoint, {
      ...restConfig,
      method: 'POST',
      headers: {
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        ...headers,
      },
      body: formData,
    });
  },
};

/**
 * Get the base API URL
 */
export function getApiUrl(): string {
  return API_URL;
}

/**
 * User-friendly error messages mapping
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.message || 'Solicitud inválida. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 408:
        return 'La solicitud tardó demasiado. Verifica tu conexión.';
      case 500:
        return 'Error del servidor. Por favor, intenta nuevamente.';
      case 503:
        return 'Servicio no disponible. Intenta más tarde.';
      default:
        return error.message || 'Ocurrió un error inesperado.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}
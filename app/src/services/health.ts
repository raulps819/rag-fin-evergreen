/**
 * Health Check Service
 *
 * Simple service to verify backend connectivity
 */

import { api } from '@/lib/api-client';

export interface HealthResponse {
  status: string;
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<HealthResponse> {
  return api.get<HealthResponse>('/health');
}

/**
 * Verify backend is reachable
 * Returns true if backend responds successfully
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await checkHealth();
    return response.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
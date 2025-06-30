/**
 * Utility function for making authenticated fetch requests
 * with support for JSON and FormData
 */
import { API_URL } from '@/utils/config';
export default async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Get the token from localStorage
  const token = localStorage.getItem('accessToken');
  
  // Check if body is FormData
  const isFormData = options.body instanceof FormData;
  
  // Prepare headers with Authorization if token exists
  const headers: HeadersInit = {
    ...options.headers,
    // Only add Content-Type if not FormData (browser will set this with boundary for FormData)
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  // Make the request with auth header
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        // Try to get a new access token
        const refreshResponse = await fetch(`${API_URL}/api/token/refresh/'`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.access);
          
          // Retry the original request with new token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              // Only add Content-Type if not FormData
              ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
              'Authorization': `Bearer ${data.access}`
            }
          });
        } else {
          // If refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('username');
          window.location.href = '/auth/login';
          throw new Error('Session expired. Please login again.');
        }
      } catch (error) {
        // Handle refresh token request error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        window.location.href = '/auth/login';
        throw error;
      }
    } else {
      // No refresh token, redirect to login
      window.location.href = '/auth/login';
      throw new Error('Unauthorized. Please login.');
    }
  }
  
  return response;
}
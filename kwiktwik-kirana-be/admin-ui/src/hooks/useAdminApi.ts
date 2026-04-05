import { useCallback, useState } from 'react';

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApi = useCallback(async (path: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        if (window.location.pathname !== '/admin/login') {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        throw new Error('Authentication required');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchApi, loading, error };
}

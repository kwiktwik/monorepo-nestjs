import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth(); // Assume we have a logout function in AuthContext

  const fetchApi = useCallback(async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // Use credentials: 'include' to automatically send the HttpOnly cookie
      const res = await fetch(`${path.startsWith('/api') ? '' : '/api/admin'}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // <--- IMPORTANT: Sends HttpOnly cookie automatically
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate('/login');
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `API Error: ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate, logout]);

  return { fetchApi, loading, error };
}

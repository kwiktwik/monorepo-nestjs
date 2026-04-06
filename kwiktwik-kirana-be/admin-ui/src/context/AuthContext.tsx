import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Store token in sessionStorage for persistence across refreshes
  // sessionStorage is cleared when the tab/browser is closed, which is appropriate for admin sessions
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session on mount to verify the cookie is still valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/check-session', {
          credentials: 'include', // Include cookies in the request
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            // Session invalid, clear token
            setToken(null);
            sessionStorage.removeItem('admin_token');
          }
        } else {
          // Session check failed, clear token
          setToken(null);
          sessionStorage.removeItem('admin_token');
        }
      } catch (error) {
        // Network error or other issue, keep current state
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Update isAuthenticated when token changes
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    sessionStorage.setItem('admin_token', newToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Ignore errors during logout
    }
    setToken(null);
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ token, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

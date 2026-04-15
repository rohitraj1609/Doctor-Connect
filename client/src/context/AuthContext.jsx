import { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session via refresh token on mount
    async function restoreSession() {
      try {
        const res = await fetch('/api/v1/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.accessToken && data.data?.user) {
            setAccessToken(data.data.accessToken);
            setUser(data.data.user);
          }
        }
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  function login(userData, accessTokenValue) {
    setUser(userData);
    setAccessToken(accessTokenValue);
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

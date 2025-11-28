import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState(null);

  const bootstrap = useCallback(async () => {
    if (authStatus !== 'idle') {
      return;
    }

    setAuthStatus('loading');
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setAuthStatus('authenticated');
    } catch (error) {
      setUser(null);
      setAuthStatus('unauthenticated');
    }
  }, [authStatus]);

  const login = useCallback(async (credentials) => {
    setAuthStatus('loading');
    setAuthError(null);
    try {
      const { data } = await api.post('/auth/login', credentials);
      setUser(data.user);
      setAuthStatus('authenticated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to log in.';
      setAuthError(message);
      setAuthStatus('unauthenticated');
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (details) => {
    setAuthStatus('loading');
    setAuthError(null);
    try {
      const { data } = await api.post('/auth/register', details);
      setUser(data.user);
      setAuthStatus('authenticated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to register.';
      setAuthError(message);
      setAuthStatus('unauthenticated');
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setAuthStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setAuthStatus('unauthenticated');
    };

    document.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      document.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      authStatus,
      authError,
      setAuthError,
      bootstrap,
      login,
      register,
      logout,
    }),
    [authError, authStatus, bootstrap, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

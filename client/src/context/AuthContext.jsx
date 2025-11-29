import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState(null);

  const userRef = useRef(user);
  const authStatusRef = useRef(authStatus);
  const hasBootstrappedRef = useRef(false);
  const bootstrappingRef = useRef(false);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  const bootstrap = useCallback(async ({ force = false } = {}) => {
    if (bootstrappingRef.current) {
      return;
    }

    if (!force && hasBootstrappedRef.current && authStatusRef.current !== 'idle') {
      return;
    }

    hasBootstrappedRef.current = true;
    bootstrappingRef.current = true;

    try {
      if (userRef.current && !force) {
        setAuthStatus('authenticated');
        return;
      }

      setAuthStatus((current) => (current === 'authenticated' ? current : 'loading'));

      // Check localStorage first, regardless of online status
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setAuthStatus('authenticated');

          if (navigator.onLine) {
            try {
              const { data } = await api
                .get('/auth/me', { timeout: 5000, retry: 0 })
                .catch(() => ({}));

              if (data?.user) {
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                setUser(data.user);
              }
            } catch (error) {
              console.log('Background refresh failed, using cached user');
            }
          }
          return;
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }

      if (!navigator.onLine) {
        setAuthStatus('unauthenticated');
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data?.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          localStorage.removeItem('auth_user');
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Auth check failed:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('auth_user');
          setUser(null);
        }

        setAuthStatus('unauthenticated');
      }
    } finally {
      bootstrappingRef.current = false;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthStatus('loading');
    setAuthError(null);
    
    // If offline, show error
    if (!navigator.onLine) {
      const message = 'Cannot log in while offline. Please check your connection.';
      setAuthError(message);
      setAuthStatus('unauthenticated');
      return { success: false, error: message };
    }

    try {
      const { data } = await api.post('/auth/login', credentials);
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(data.user));
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
    
    // If offline, show error
    if (!navigator.onLine) {
      const message = 'Cannot register while offline. Please check your connection.';
      setAuthError(message);
      setAuthStatus('unauthenticated');
      return { success: false, error: message };
    }

    try {
      const { data } = await api.post('/auth/register', details);
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(data.user));
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
      if (navigator.onLine) {
        await api.post('/auth/logout');
      }
    } finally {
      localStorage.removeItem('auth_user');
      setUser(null);
      setAuthStatus('unauthenticated');
      hasBootstrappedRef.current = false;
    }
  }, []);

  // Bootstrap authentication on initial load and when auth status changes
  useEffect(() => {
    if (authStatus === 'idle') {
      bootstrap();
    }
  }, [authStatus, bootstrap]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      hasBootstrappedRef.current = false;
      bootstrap({ force: true });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [bootstrap]);

  // Handle unauthorized responses
  useEffect(() => {
    const handleUnauthorized = (event) => {
      // Only log out if this is a 401 response for an auth endpoint
      if (
        event.detail?.status === 401 &&
        event.detail?.url?.includes('/auth/')
      ) {
        localStorage.removeItem('auth_user');
        setUser(null);
        setAuthStatus('unauthenticated');
        hasBootstrappedRef.current = false;
      }
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

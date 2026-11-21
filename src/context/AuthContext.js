'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { setupApiInterceptors } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const tokenRef = useRef(null);
  const refreshingPromiseRef = useRef(null);

  const updateAccessToken = useCallback((token) => {
    tokenRef.current = token;
    setAccessToken(token);
  }, []);

  // Silent refresh token handler with single-flight de-duplication
  const refreshAccessToken = useCallback(async () => {
    if (refreshingPromiseRef.current) {
      return refreshingPromiseRef.current;
    }

    refreshingPromiseRef.current = (async () => {
      try {
        const response = await api.post('/admin/refresh-token');
        if (response.data?.success && response.data?.accessToken) {
          const { accessToken: newToken, admin: adminData } = response.data;
          updateAccessToken(newToken);
          setAdmin(adminData);
          return newToken;
        }
        return null;
      } catch (err) {
        updateAccessToken(null);
        setAdmin(null);
        return null;
      } finally {
        refreshingPromiseRef.current = null;
      }
    })();

    return refreshingPromiseRef.current;
  }, [updateAccessToken]);

  // Robust Logout handler
  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } catch (err) {
      console.warn('Logout request error:', err?.message);
    } finally {
      updateAccessToken(null);
      setAdmin(null);
      // Clean up any client accessible cookies if present
      if (typeof document !== 'undefined') {
        document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;';
      }
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }
  }, [updateAccessToken]);

  // Wire up interceptors
  useEffect(() => {
    setupApiInterceptors(
      () => tokenRef.current,
      refreshAccessToken,
      logout
    );
  }, [refreshAccessToken, logout]);

  // Initial session recovery on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        await refreshAccessToken();
      } catch (err) {
        // Not authenticated
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshAccessToken]);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    if (response.data?.success) {
      const { accessToken: token, admin: adminData } = response.data;
      updateAccessToken(token);
      setAdmin(adminData);
      return { success: true, admin: adminData };
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  const value = {
    admin,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
        const fallbackToken =
          typeof window !== 'undefined' ? localStorage.getItem('mg_admin_refresh_fallback') : null;

        const response = await api.post('/admin/refresh-token', {
          refreshToken: fallbackToken || undefined,
        });

        if (response.data?.success && response.data?.accessToken) {
          const { accessToken: newToken, refreshToken: newRefreshToken, admin: adminData } = response.data;
          updateAccessToken(newToken);
          setAdmin(adminData);
          if (newRefreshToken && typeof window !== 'undefined') {
            localStorage.setItem('mg_admin_refresh_fallback', newRefreshToken);
          }
          return newToken;
        }
        return null;
      } catch (err) {
        updateAccessToken(null);
        setAdmin(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mg_admin_refresh_fallback');
        }
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
      const fallbackToken =
        typeof window !== 'undefined' ? localStorage.getItem('mg_admin_refresh_fallback') : null;
      await api.post('/admin/logout', { refreshToken: fallbackToken || undefined });
    } catch (err) {
      console.warn('Logout request error:', err?.message);
    } finally {
      updateAccessToken(null);
      setAdmin(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mg_admin_refresh_fallback');
      }
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
      const { accessToken: token, refreshToken: refToken, admin: adminData } = response.data;
      updateAccessToken(token);
      setAdmin(adminData);
      if (refToken && typeof window !== 'undefined') {
        localStorage.setItem('mg_admin_refresh_fallback', refToken);
      }
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

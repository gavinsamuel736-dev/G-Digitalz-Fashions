import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AuditLog } from '../types';

interface AdminContextType {
  token: string | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  showAdminNotification: (msg: string, type?: 'success' | 'error') => void;
  adminAlert: { message: string; type: 'success' | 'error' } | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gdigitalz_admin_token') || localStorage.getItem('peterz_admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const cached = localStorage.getItem('gdigitalz_admin_user') || localStorage.getItem('peterz_admin_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');
  const [adminAlert, setAdminAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAdminNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminAlert({ message, type });
    setTimeout(() => {
      setAdminAlert(null);
    }, 4000);
  };

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
          localStorage.setItem('gdigitalz_admin_user', JSON.stringify(data.user));
        } else {
          // Token invalid or expired
          logoutLocal();
        }
      } catch (err) {
        console.error('Session verification network error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const logoutLocal = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('gdigitalz_admin_token');
    localStorage.removeItem('gdigitalz_admin_user');
    localStorage.removeItem('peterz_admin_token');
    localStorage.removeItem('peterz_admin_user');
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem('gdigitalz_admin_token', data.token);
      localStorage.setItem('gdigitalz_admin_user', JSON.stringify(data.user));
      showAdminNotification(`Welcome back, ${data.user.fullName}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Logout request failed:', err);
      }
    }
    logoutLocal();
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      logoutLocal();
    }
    return response;
  };

  return (
    <AdminContext.Provider
      value={{
        token,
        adminUser,
        isAuthenticated: Boolean(token && adminUser),
        isLoading,
        login,
        logout,
        authFetch,
        adminActiveTab,
        setAdminActiveTab,
        showAdminNotification,
        adminAlert,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

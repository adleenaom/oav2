import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiPost, apiFetch, setAuth, clearAuth } from '../services/api';

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  credits: number;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ============================================
// Provider
// ============================================

function getDeviceId(): string {
  return localStorage.getItem('oa_device_id') || 'pwa-unknown';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on mount — ping the API
  useEffect(() => {
    const token = localStorage.getItem('oa_auth_token');
    const userId = localStorage.getItem('oa_auth_user_id');
    if (!token || !userId) {
      setIsLoading(false);
      return;
    }
    // Fetch profile to verify token is still valid
    apiPost<{ credits: number; name?: string; email?: string }>('/v3/profile/home', {})
      .then(res => {
        setUser({
          id: parseInt(userId),
          name: res.name || 'User',
          email: res.email || '',
          avatar: '',
          credits: res.credits || 0,
          role: 'user',
        });
        setIsLoading(false);
      })
      .catch(() => {
        clearAuth();
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{
      status?: number;
      message?: string;
      token: string;
      user_id: number;
      platform: string;
    }>('/auth/login', {
      email,
      password,
      device_id: getDeviceId(),
      device_model: navigator.userAgent.substring(0, 50),
      os_version: 'Web',
      fcm_token: '',
    });

    if (!res.token) {
      throw new Error(res.message || 'Login failed');
    }

    setAuth(res.token, res.user_id);

    const authUser: AuthUser = {
      id: res.user_id,
      name: email.split('@')[0],
      email,
      avatar: '',
      credits: 0,
      role: 'user',
    };
    setUser(authUser);

    // Fetch profile for credits
    try {
      const profile = await apiPost<{ credits?: number; name?: string }>('/v3/profile/tokens', {});
      authUser.credits = profile.credits || 0;
      if (profile.name) authUser.name = profile.name;
      setUser({ ...authUser });
    } catch { /* ignore */ }

    return authUser;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiPost<{
      status?: number;
      message?: string;
      token: string;
      user_id: number;
      platform: string;
    }>('/guest/register', {
      data: { name, email, password, password_confirmation: password },
      platform: 'email',
      token: '',
      tag_ids: [],
      learning_goal_id: '',
      enable_notification: false,
      device_id: getDeviceId(),
      device_model: navigator.userAgent.substring(0, 50),
      os_version: 'Web',
    });

    if (!res.token) {
      throw new Error(res.message || 'Registration failed');
    }

    setAuth(res.token, res.user_id);

    const authUser: AuthUser = {
      id: res.user_id,
      name,
      email,
      avatar: '',
      credits: 0,
      role: 'user',
    };
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    // Call logout endpoint (fire and forget)
    apiFetch('/auth/logout').catch(() => {});
    clearAuth();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await apiPost<{ credits?: number; name?: string; email?: string }>('/v3/profile/tokens', {});
      setUser(prev => prev ? {
        ...prev,
        credits: profile.credits || prev.credits,
        name: profile.name || prev.name,
      } : null);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

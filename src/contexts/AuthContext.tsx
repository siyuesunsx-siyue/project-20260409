'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.user) {
          setUser(data.user);
          // 同步到localStorage
          localStorage.setItem('user_id', String(data.user.id));
          localStorage.setItem('username', data.user.username);
        } else {
          // API 返回用户为 null，清除 localStorage 中的旧信息
          localStorage.removeItem('user_id');
          localStorage.removeItem('username');
        }
      } catch {
        // 网络错误时，尝试验证 localStorage 中的用户是否有效
        const userId = localStorage.getItem('user_id');
        const username = localStorage.getItem('username');

        if (userId && username) {
          // 尝试验证用户是否仍然有效
          try {
            const verifyRes = await fetch('/api/game-records/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.valid) {
              setUser({ id: parseInt(userId, 10), username: username });
            } else {
              // 用户无效，清除 localStorage
              localStorage.removeItem('user_id');
              localStorage.removeItem('username');
            }
          } catch {
            // 验证失败，清除 localStorage
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || '登录失败' };
      }

      setUser(data.user);
      localStorage.setItem('user_id', String(data.user.id));
      localStorage.setItem('username', data.user.username);

      return { success: true };
    } catch {
      return { success: false, error: '登录失败，请稍后重试' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || '注册失败' };
      }

      setUser(data.user);
      localStorage.setItem('user_id', String(data.user.id));
      localStorage.setItem('username', data.user.username);

      return { success: true };
    } catch {
      return { success: false, error: '注册失败，请稍后重试' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // 忽略错误
    } finally {
      setUser(null);
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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

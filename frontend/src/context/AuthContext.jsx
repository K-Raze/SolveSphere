import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('solvesphere_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('solvesphere_token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = async (emailId, password) => {
    const res = await authAPI.login({ emailId, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('solvesphere_token', newToken);
    localStorage.setItem('solvesphere_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('solvesphere_token', newToken);
    localStorage.setItem('solvesphere_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('solvesphere_token');
    localStorage.removeItem('solvesphere_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await authAPI.getProfile();
      setUser(res.data.data || res.data);
      localStorage.setItem('solvesphere_user', JSON.stringify(res.data.data || res.data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

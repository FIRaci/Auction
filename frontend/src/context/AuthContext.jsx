import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('royal_token'));
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function refreshMe() {
    const activeToken = localStorage.getItem('royal_token');
    if (!activeToken) {
      setUser(null);
      setCurrentRoom(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiRequest('/auth/me', 'GET', null, activeToken);
      if (res.success && localStorage.getItem('royal_token') === activeToken) {
        setUser(res.data.user);
        setCurrentRoom(res.data.currentRoom);
      }
    } catch (err) {
      console.warn('Phiên đăng nhập hết hạn:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await apiRequest('/auth/login', 'POST', { email, password });
    if (res.success) {
      localStorage.setItem('royal_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  }

  async function register(email, password, fullName, phone) {
    const res = await apiRequest('/auth/register', 'POST', { email, password, fullName, phone });
    if (res.success) {
      localStorage.setItem('royal_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  }

  function logout() {
    const activeToken = localStorage.getItem('royal_token');
    if (activeToken && currentRoom) {
      apiRequest('/rooms/leave', 'POST', null, activeToken).catch(() => {});
    }
    localStorage.removeItem('royal_token');
    setToken(null);
    setUser(null);
    setCurrentRoom(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRoom,
        setCurrentRoom,
        loading,
        login,
        register,
        logout,
        refreshMe,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}


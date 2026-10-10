import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zerowaste_token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('zerowaste_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zerowaste_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} mode`, { icon: nextTheme === 'dark' ? '🌙' : '☀️' });
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe(token);
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired:', err.message);
          localStorage.removeItem('zerowaste_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('zerowaste_token', res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('zerowaste_token', res.token);
      toast.success(`Registration successful! Welcome to ZeroWaste.`);
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const demoLogin = async (role = 'donor') => {
    let credentials = { email: 'donor@zerowaste.org', password: 'password123' };
    if (role === 'recipient') {
      credentials = { email: 'recipient@zerowaste.org', password: 'password123' };
    } else if (role === 'ngo') {
      credentials = { email: 'ngo@zerowaste.org', password: 'password123' };
    }

    try {
      const res = await api.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('zerowaste_token', res.token);
      toast.success(`Logged in as Demo ${role.toUpperCase()}: ${res.user.name}`, { icon: '⚡' });
      return res.user;
    } catch (err) {
      console.warn('First demo login attempt failed. Re-seeding DB and retrying...');
      try {
        await api.seedDatabase();
        const res2 = await api.login(credentials);
        setToken(res2.token);
        setUser(res2.user);
        localStorage.setItem('zerowaste_token', res2.token);
        toast.success(`Logged in as Demo ${role.toUpperCase()}: ${res2.user.name}`, { icon: '⚡' });
        return res2.user;
      } catch (seedErr) {
        toast.error('Demo login failed. Could not seed database.');
        throw seedErr;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('zerowaste_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        role: user ? user.role : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

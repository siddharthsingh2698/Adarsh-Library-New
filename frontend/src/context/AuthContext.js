import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('alms_token');
    const stored = localStorage.getItem('alms_admin');
    if (token && stored) {
      setAdmin(JSON.parse(stored));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('alms_token', data.token);
    localStorage.setItem('alms_admin', JSON.stringify(data.admin));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('alms_token');
    localStorage.removeItem('alms_admin');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

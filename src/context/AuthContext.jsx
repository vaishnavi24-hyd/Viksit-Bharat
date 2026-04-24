import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
          const res = await axios.get(`${API_URL}/user`);
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Token verification failed", err);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (newToken, userData) => {
    // Note: token and role are already set in localStorage by Login.jsx per requirement,
    // but we can set it here too if needed, though they already exist.
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#F97316' }}>
      <h2>Loading Viksit Bharat...</h2>
    </div>
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, API_URL, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

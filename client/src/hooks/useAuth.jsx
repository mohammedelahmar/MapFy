import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fix: Use Authorization header with Bearer format
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/api/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data.data.user);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const setAuthUser = async (token) => {
  try {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const userRes = await axios.get('/api/auth/me');
    setUser(userRes.data.data.user);
    return true;
  } catch (err) {
    console.error('Error setting authentication:', err);
    return false;
  }
};

return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      login,
      logout,
      setAuthUser, // Add this new method
      isAuthenticated: !!user,
    }}
  >
    {children}
  </AuthContext.Provider>
);
}
export const useAuth = () => {
  return useContext(AuthContext);
};
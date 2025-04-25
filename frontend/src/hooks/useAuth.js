// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

// Mock para autenticación (reemplaza con tu implementación real)
const mockAuthService = {
  login: async (email, password) => {
    // Simulamos verificación de credenciales
    if (email === 'admin@example.com' && password === 'password123') {
      const user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };
      
      // Simular token JWT (en implementación real sería del backend)
      const token = `mock-jwt-${Date.now()}`;
      
      // Guardar en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } else if (email === 'user@example.com' && password === 'password123') {
      const user = {
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
      };
      
      const token = `mock-jwt-${Date.now()}`;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    }
    
    throw new Error('Credenciales inválidas');
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// Hook personalizado de autenticación
function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Verificar autenticación al cargar
    const loadUser = () => {
      setLoading(true);
      try {
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          const user = mockAuthService.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Función de login
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await mockAuthService.login(email, password);
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return result;
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Función de logout
  const logout = () => {
    mockAuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  // Función para comprobar si usuario tiene rol de admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };
  
  return {
    currentUser,
    login,
    logout,
    isAdmin,
    loading,
    error,
    isAuthenticated
  };
}

export default useAuth;
// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Crear el contexto
export const AuthContext = createContext();

// Hook personalizado para usar el contexto (evita importar useContext en cada componente)
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario al iniciar
  useEffect(() => {
    // Intenta cargar el usuario desde localStorage
    const loadUser = () => {
      try {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función de login
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la autenticación');
      throw err;
    }
  };

  // Función de logout
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Función de registro
  const register = async (userData) => {
    setError(null);
    try {
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
      throw err;
    }
  };

  // Verificar si el usuario tiene rol de admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Valor proporcionado por el contexto
  const value = {
    currentUser,
    login,
    logout,
    register,
    isAdmin,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
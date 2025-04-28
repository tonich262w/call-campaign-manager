// src/hooks/useAuth.js

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configurar el token para la petición
          axios.defaults.headers.common['x-auth-token'] = token;
          // También configurar como Authorization Bearer para mayor compatibilidad
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validar el token con el backend
          const response = await axios.get(`${API_URL}/auth/verify-token`);
          
          if (response.data && response.data.user) {
            setUser(response.data.user);
            console.log('✅ Sesión restaurada para:', response.data.user.email);
          } else {
            // Token inválido, limpiar localStorage
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            console.log('❌ Token inválido, sesión cerrada');
          }
        } catch (error) {
          console.error('Error validando token:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('No hay token almacenado');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [API_URL]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      console.log(`Intentando login para: ${email}`);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { token, user } = response.data;
      console.log('Login exitoso. Datos recibidos:', response.data);
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar el token para futuras peticiones
      axios.defaults.headers.common['x-auth-token'] = token;
      // También configurar como Authorization Bearer para mayor compatibilidad
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      // Extraer mensaje de error específico si existe
      const errorMessage = error.response?.data?.message || 
                          'Error al conectar con el servidor';
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('Sesión cerrada');
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar el token para futuras peticiones
      axios.defaults.headers.common['x-auth-token'] = token;
      // También configurar como Authorization Bearer para mayor compatibilidad
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Error de registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Obtener token para peticiones API
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Verificar si el usuario está logueado (tiene token)
  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  // Obtener el usuario actual
  const getCurrentUser = () => {
    return user;
  };

  const authValue = {
    user,
    loading,
    login,
    logout,
    register,
    hasRole,
    getToken,
    isAuthenticated,
    isLoggedIn,
    getCurrentUser,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default useAuth;
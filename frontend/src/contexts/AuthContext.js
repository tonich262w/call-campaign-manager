import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  // Función simulada de inicio de sesión
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Simulación de llamada a API
      console.log('Login con:', credentials);
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usuario ficticio para pruebas
      const userData = {
        id: '123',
        name: credentials.email.split('@')[0], // Usar parte del email como nombre
        email: credentials.email,
        role: 'user',
        balance: 100
      };
      
      setUser(userData);
      // Guardar info en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};



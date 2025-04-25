// src/contexts/BalanceContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { balanceService } from '../services/api';
import { useAuth } from './AuthContext';

// Crear el contexto
export const BalanceContext = createContext();

// Hook personalizado para usar el contexto
export const useBalance = () => {
  return useContext(BalanceContext);
};

// Proveedor del contexto
export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminBalanceDetails, setAdminBalanceDetails] = useState(null);
  
  const { currentUser, isAdmin } = useAuth();

  // Cargar balance al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (currentUser) {
      fetchBalance();
      fetchTransactions();
      
      // Si es admin, cargar también los detalles de balance real vs inflado
      if (isAdmin()) {
        fetchAdminBalanceDetails();
      }
    } else {
      // Reiniciar estados si no hay usuario
      setBalance(0);
      setTransactions([]);
      setAdminBalanceDetails(null);
      setLoading(false);
    }
  }, [currentUser]);

  // Función para obtener el balance actual
  const fetchBalance = async () => {
    setLoading(true);
    try {
      const data = await balanceService.getBalance();
      setBalance(data.balance);
      setError(null);
    } catch (err) {
      setError('Error al cargar el saldo');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las transacciones
  const fetchTransactions = async () => {
    try {
      const data = await balanceService.getTransactions();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Transactions fetch error:', err);
    }
  };

  // Función para obtener detalles de admin (sólo para admins)
  const fetchAdminBalanceDetails = async () => {
    try {
      const data = await balanceService.getAdminBalanceDetails();
      setAdminBalanceDetails(data);
    } catch (err) {
      console.error('Admin balance details fetch error:', err);
    }
  };

  // Función para añadir fondos
  const addFunds = async (amount) => {
    setError(null);
    try {
      const data = await balanceService.addFunds(amount);
      setBalance(data.balance);
      
      // Actualizar transacciones después de añadir fondos
      fetchTransactions();
      
      return data;
    } catch (err) {
      setError('Error al añadir fondos');
      console.error('Add funds error:', err);
      throw err;
    }
  };

  // Para administradores: cálculo del factor de inflación
  const getInflationFactor = () => {
    if (!adminBalanceDetails) return 2; // Factor por defecto
    return adminBalanceDetails.inflationFactor || 2;
  };

  // Para administradores: obtener el balance real (sin inflar)
  const getRealBalance = () => {
    if (!adminBalanceDetails) return balance / 2; // Aproximación
    return adminBalanceDetails.realBalance || balance / 2;
  };

  // Valor proporcionado por el contexto
  const value = {
    balance,
    transactions,
    loading,
    error,
    addFunds,
    refreshBalance: fetchBalance,
    // Funcionalidades para administradores
    adminBalanceDetails,
    getInflationFactor,
    getRealBalance,
    isInflatedBalance: true // Indica que el balance mostrado está inflado
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalanceProvider;
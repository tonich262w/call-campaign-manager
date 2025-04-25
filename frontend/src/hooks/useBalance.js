// src/hooks/useBalance.js
import { useState, useEffect } from 'react';
import balanceService from '../services/balanceService';
import useAuth from './useAuth';

function useBalance() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [campaignCosts, setCampaignCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  
  const { currentUser, isAdmin: checkIsAdmin } = useAuth();
  
  // Cargar balance y transacciones al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (currentUser) {
      fetchBalance();
      fetchTransactions();
      fetchCampaignCosts();
      fetchSystemConfig();
      
      // Para administradores, cargar datos adicionales
      if (checkIsAdmin()) {
        fetchAdminData();
      }
    } else {
      // Reiniciar estados si no hay usuario
      setBalance(0);
      setTransactions([]);
      setCampaignCosts([]);
      setAdminData(null);
      setSystemConfig(null);
      setLoading(false);
    }
  }, [currentUser, checkIsAdmin]);

  // Obtener balance del usuario
  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await balanceService.getBalance();
      setBalance(response.balance);
      setError(null);
    } catch (err) {
      console.error('Error cargando balance:', err);
      setError('Error al cargar el balance');
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de transacciones
  const fetchTransactions = async () => {
    try {
      const response = await balanceService.getTransactions();
      setTransactions(response.transactions);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
    }
  };

  // Obtener costos por campaña
  const fetchCampaignCosts = async () => {
    try {
      const response = await balanceService.getCampaignCosts();
      setCampaignCosts(response.campaigns);
    } catch (err) {
      console.error('Error cargando costos por campaña:', err);
    }
  };

  // Obtener configuración del sistema
  const fetchSystemConfig = async () => {
    try {
      const config = await balanceService.getSystemConfig();
      setSystemConfig(config);
    } catch (err) {
      console.error('Error cargando configuración del sistema:', err);
    }
  };

  // Solo para admins: obtener datos detallados
  const fetchAdminData = async () => {
    try {
      const adminDetails = await balanceService.getAdminBalanceDetails();
      setAdminData(adminDetails);
    } catch (err) {
      console.error('Error cargando datos de administrador:', err);
    }
  };

  // Añadir fondos
  const addFunds = async (amount) => {
    setError(null);
    try {
      const response = await balanceService.addFunds(amount);
      setBalance(response.balance);
      
      // Actualizar transacciones
      fetchTransactions();
      
      return response;
    } catch (err) {
      console.error('Error añadiendo fondos:', err);
      setError(err.message || 'Error al añadir fondos');
      throw err;
    }
  };

  // Solo para admins: actualizar configuración
  const updateSystemConfig = async (config) => {
    if (!checkIsAdmin()) {
      throw new Error('Solo los administradores pueden actualizar la configuración');
    }
    
    try {
      const response = await balanceService.updateSystemConfig(config);
      
      // Actualizar datos locales
      setSystemConfig(response.config);
      
      // Actualizar datos de admin
      fetchAdminData();
      
      return response;
    } catch (err) {
      console.error('Error actualizando configuración:', err);
      throw err;
    }
  };

  // Helper para calcular inflación
  const getInflationFactor = () => {
    return systemConfig?.inflationFactor || 2;
  };

  return {
    balance,
    transactions,
    campaignCosts,
    loading,
    error,
    addFunds,
    refreshBalance: fetchBalance,
    refreshTransactions: fetchTransactions,
    refreshCampaignCosts: fetchCampaignCosts,
    
    // Datos del sistema
    systemConfig,
    
    // Solo para admins
    adminData,
    updateSystemConfig,
    getInflationFactor,
    
    // Indicador de balance inflado
    isInflatedBalance: true
  };
}

export default useBalance;
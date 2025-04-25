import React, { createContext, useState, useContext, useEffect } from 'react';
import { balanceService } from '../services/callService';

// Create the balance context
const BalanceContext = createContext();

// Balance provider component
export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState({
    currentBalance: 0,
    totalSpent: 0,
    isLoading: true,
    error: null,
  });
  
  const [transactions, setTransactions] = useState([]);
  const [campaignCosts, setCampaignCosts] = useState([]);
  
  // Load initial balance data
  useEffect(() => {
    const loadBalanceData = async () => {
      try {
        // In a real app, these would be API calls using the service functions
        // For now, we'll simulate with a timeout and mock data
        
        setTimeout(() => {
          setBalance({
            currentBalance: 250.00,
            totalSpent: 750.00,
            isLoading: false,
            error: null
          });
          
          setTransactions([
            {
              id: 1,
              date: '2025-03-15',
              type: 'charge',
              amount: 200.00,
              description: 'Recarga de saldo',
              status: 'completed'
            },
            {
              id: 2,
              date: '2025-03-17',
              type: 'expense',
              amount: 75.00,
              description: 'Consumo Campaña "Ventas Q1"',
              campaignId: 1,
              status: 'completed'
            },
            {
              id: 3,
              date: '2025-04-01',
              type: 'charge',
              amount: 150.00,
              description: 'Recarga de saldo',
              status: 'completed'
            },
            {
              id: 4,
              date: '2025-04-10',
              type: 'expense',
              amount: 25.00,
              description: 'Consumo Campaña "Seguimiento Clientes"',
              campaignId: 2,
              status: 'completed'
            }
          ]);
          
          setCampaignCosts([
            {
              id: 1,
              name: 'Campaña Ventas Q1',
              calls: 208,
              totalMinutes: 785,
              cost: 75.00,
              status: 'active'
            },
            {
              id: 2,
              name: 'Seguimiento Clientes',
              calls: 89,
              totalMinutes: 267,
              cost: 25.00,
              status: 'paused'
            }
          ]);
        }, 1000);
        
        // In production, use these service calls instead:
        /*
        const balanceData = await balanceService.getBalance();
        setBalance({
          currentBalance: balanceData.currentBalance,
          totalSpent: balanceData.totalSpent,
          isLoading: false,
          error: null
        });
        
        const transactionsData = await balanceService.getTransactions();
        setTransactions(transactionsData);
        
        const campaignCostsData = await balanceService.getCampaignCosts();
        setCampaignCosts(campaignCostsData);
        */
      } catch (error) {
        console.error('Error loading balance data:', error);
        setBalance({
          currentBalance: 0,
          totalSpent: 0,
          isLoading: false,
          error: 'No se pudo cargar la información de saldo.'
        });
      }
    };
    
    loadBalanceData();
  }, []);
  
  // Add funds to balance
  const addFunds = async (amount) => {
    try {
      // Call balance service to add funds
      // const result = await balanceService.addFunds(amount);
      
      // Simulate API call for now
      return new Promise((resolve) => {
        setTimeout(() => {
          // Update local state
          setBalance(prev => ({
            ...prev,
            currentBalance: prev.currentBalance + Number(amount)
          }));
          
          // Add new transaction
          const newTransaction = {
            id: transactions.length + 1,
            date: new Date().toISOString().split('T')[0],
            type: 'charge',
            amount: Number(amount),
            description: 'Recarga de saldo',
            status: 'completed'
          };
          
          setTransactions([newTransaction, ...transactions]);
          
          resolve({ success: true, message: 'Saldo recargado exitosamente' });
        }, 1000);
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      return { success: false, message: 'Error al recargar saldo' };
    }
  };
  
  // Calculate estimated cost for a campaign
  const calculateCampaignCost = (leadCount, avgCallDuration = 3) => {
    // Using the "doubled" rate defined in callService
    const costPerCall = 0.10; // This is the inflated rate (actual rate is 0.05)
    const costPerMinute = 0.02; // This is the inflated rate (actual rate is 0.01)
    
    const callCost = leadCount * costPerCall;
    const minuteCost = leadCount * avgCallDuration * costPerMinute;
    
    return {
      callCost,
      minuteCost,
      totalCost: callCost + minuteCost,
      perLeadCost: (callCost + minuteCost) / leadCount
    };
  };
  
  // Check if there's sufficient balance for a campaign
  const checkSufficientBalance = (leadCount, avgCallDuration = 3) => {
    const { totalCost } = calculateCampaignCost(leadCount, avgCallDuration);
    return {
      sufficient: balance.currentBalance >= totalCost,
      remaining: balance.currentBalance - totalCost,
      required: totalCost
    };
  };
  
  // Update balance after campaign operation
  const deductCampaignCost = async (campaignId, campaignName, calls, minutes) => {
    try {
      // In production, call the balance service
      // const result = await balanceService.deductCampaignCost(campaignId, calls, minutes);
      
      // For now, simulate the API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const { totalCost } = calculateCampaignCost(calls, minutes / calls);
          
          // Update balance
          setBalance(prev => ({
            ...prev,
            currentBalance: prev.currentBalance - totalCost,
            totalSpent: prev.totalSpent + totalCost
          }));
          
          // Add expense transaction
          const newTransaction = {
            id: transactions.length + 1,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            amount: totalCost,
            description: `Consumo Campaña "${campaignName}"`,
            campaignId,
            status: 'completed'
          };
          
          setTransactions([newTransaction, ...transactions]);
          
          // Update campaign costs
          const existingCostIndex = campaignCosts.findIndex(c => c.id === campaignId);
          
          if (existingCostIndex >= 0) {
            // Update existing campaign cost
            const updatedCosts = [...campaignCosts];
            updatedCosts[existingCostIndex] = {
              ...updatedCosts[existingCostIndex],
              calls: updatedCosts[existingCostIndex].calls + calls,
              totalMinutes: updatedCosts[existingCostIndex].totalMinutes + minutes,
              cost: updatedCosts[existingCostIndex].cost + totalCost
            };
            setCampaignCosts(updatedCosts);
          } else {
            // Add new campaign cost
            setCampaignCosts([...campaignCosts, {
              id: campaignId,
              name: campaignName,
              calls,
              totalMinutes: minutes,
              cost: totalCost,
              status: 'active'
            }]);
          }
          
          resolve({ success: true });
        }, 1000);
      });
    } catch (error) {
      console.error('Error deducting campaign cost:', error);
      return { success: false, message: 'Error al procesar el costo de la campaña' };
    }
  };
  
  // Value to be provided by the context
  const value = {
    balance,
    transactions,
    campaignCosts,
    addFunds,
    calculateCampaignCost,
    checkSufficientBalance,
    deductCampaignCost
  };
  
  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook to use the balance context
export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

export default BalanceContext;

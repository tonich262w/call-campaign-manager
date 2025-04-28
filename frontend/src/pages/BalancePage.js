// src/pages/BalancePage.js

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaSync, FaHistory, FaCreditCard } from 'react-icons/fa';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import StripePayment from '../components/StripePayment';
import { Balance } from '../services/apiService';

const BalancePage = () => {
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [transactionsData, setTransactionsData] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Cargar datos reales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingTransactions(true);
        setError(null);
        
        // Cargar datos de saldo y transacciones
        const balanceInfo = await Balance.getInfo();
        setBalanceData(balanceInfo || {
          balance: 0,
          callCost: 0.15,
          costLastUpdated: new Date(),
          totalSpent: 0,
          totalCalls: 0
        });
        
        const transactions = await Balance.getTransactions();
        setTransactionsData(transactions || { transactions: [] });
        
        setLoading(false);
        setLoadingTransactions(false);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading balance data:', err);
        setError('Error al cargar los datos de saldo');
        setLoading(false);
        setLoadingTransactions(false);
        
        // Si hay un error, mostrar datos de ejemplo para desarrollo
        const mockBalanceData = {
          balance: 250.75,
          callCost: 0.15,
          costLastUpdated: new Date(2025, 3, 1),
          totalSpent: 100,
          totalCalls: 500
        };

        const mockTransactionsData = {
          transactions: [
            {
              _id: '1',
              date: new Date(2025, 3, 25),
              type: 'deposit',
              description: 'Recarga de saldo',
              amount: 100,
              balanceAfter: 250.75
            },
            {
              _id: '2',
              date: new Date(2025, 3, 20),
              type: 'charge',
              description: 'Campaña de Ventas Q2 - 50 llamadas',
              amount: -7.50,
              balanceAfter: 150.75
            },
            {
              _id: '3',
              date: new Date(2025, 3, 15),
              type: 'deposit',
              description: 'Recarga de saldo',
              amount: 50,
              balanceAfter: 158.25
            },
            {
              _id: '4',
              date: new Date(2025, 3, 10),
              type: 'charge',
              description: 'Seguimiento Clientes - 25 llamadas',
              amount: -3.75,
              balanceAfter: 108.25
            },
            {
              _id: '5',
              date: new Date(2025, 3, 5),
              type: 'deposit',
              description: 'Recarga inicial',
              amount: 112,
              balanceAfter: 112
            }
          ]
        };

        setBalanceData(mockBalanceData);
        setTransactionsData(mockTransactionsData);
      }
    };

    loadData();
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(50);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Cargar datos de saldo y transacciones
      const balanceInfo = await Balance.getInfo();
      setBalanceData(balanceInfo || {
        balance: 0,
        callCost: 0.15,
        costLastUpdated: new Date(),
        totalSpent: 0,
        totalCalls: 0
      });
      
      const transactions = await Balance.getTransactions();
      setTransactionsData(transactions || { transactions: [] });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing balance data:', err);
      setError('Error al actualizar los datos de saldo');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="balance-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saldo y Pagos</h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-3">
              Última actualización: {format(new Date(lastUpdated), 'HH:mm:ss')}
            </span>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded 
              ${(loading || isRefreshing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && !balanceData && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando información de saldo...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={handleManualRefresh}
            className="text-red-700 underline mt-2"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {balanceData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg text-gray-500 mb-2">Saldo actual</h3>
            <div className="text-3xl font-bold">${(balanceData.balance || 0).toFixed(2)}</div>
            {balanceData.source && (
              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded ${balanceData.source === 'voximplant' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {balanceData.source === 'voximplant' ? 'Saldo real de Voximplant' : 'Saldo de base de datos'}
                </span>
              </div>
            )}
            <div className="mt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Llamadas disponibles (est.):</span>
                <span>{Math.floor((balanceData.balance || 0) / (balanceData.callCost || 1))}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg text-gray-500 mb-2">Costo por llamada</h3>
            <div className="text-3xl font-bold">${(balanceData.callCost || 0).toFixed(2)}</div>
            <div className="mt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Última modificación:</span>
                <span>{balanceData.costLastUpdated ? 
                  format(new Date(balanceData.costLastUpdated), 'dd/MM/yyyy') : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg text-gray-500 mb-2">Total gastado</h3>
            <div className="text-3xl font-bold">${(balanceData.totalSpent || 0).toFixed(2)}</div>
            <div className="mt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Llamadas realizadas:</span>
                <span>{balanceData.totalCalls || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
          <TabList className="flex border-b mb-6">
            <Tab className="mr-4 py-2 px-4 cursor-pointer border-b-2 border-transparent hover:text-blue-500">
              Recargar saldo
            </Tab>
            <Tab className="mr-4 py-2 px-4 cursor-pointer border-b-2 border-transparent hover:text-blue-500">
              Historial de transacciones
            </Tab>
          </TabList>

          <TabPanel>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Selecciona un método de pago</h3>
              
              <Tabs>
                <TabList className="flex mb-4">
                  <Tab className="mr-2 py-2 px-4 rounded-t-lg cursor-pointer bg-gray-100 hover:bg-gray-200">
                    <div className="flex items-center">
                      <FaCreditCard className="mr-2" />
                      Tarjeta de crédito/débito
                    </div>
                  </Tab>
                  <Tab className="py-2 px-4 rounded-t-lg cursor-pointer bg-gray-100 hover:bg-gray-200">
                    <div className="flex items-center">
                      <FaHistory className="mr-2" />
                      Transferencia bancaria
                    </div>
                  </Tab>
                </TabList>

                <TabPanel>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium mb-4">Recarga con tarjeta</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto a recargar
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          min="10"
                          step="5"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <label htmlFor="currency" className="sr-only">
                            Moneda
                          </label>
                          <select
                            id="currency"
                            name="currency"
                            className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                          >
                            <option>USD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <StripePayment amount={rechargeAmount} />
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium mb-4">Recarga por transferencia bancaria</h4>
                    <p className="mb-4 text-gray-600">
                      Realiza una transferencia a la siguiente cuenta bancaria y envía el comprobante.
                    </p>
                    
                    <div className="bg-white p-4 rounded border border-gray-200 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Banco</p>
                          <p className="font-medium">Banco Nacional</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Titular</p>
                          <p className="font-medium">Call Campaign Manager S.A.</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cuenta</p>
                          <p className="font-medium">1234-5678-90-1234567890</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">SWIFT/BIC</p>
                          <p className="font-medium">BNCEXMPL123</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto transferido
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de transferencia
                      </label>
                      <input
                        type="date"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia/Número de transferencia
                      </label>
                      <input
                        type="text"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Ref. de transferencia o últimos 4 dígitos"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comprobante de pago (opcional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Subir un archivo</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                            </label>
                            <p className="pl-1">o arrastrar y soltar</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Enviar información de pago
                      </button>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </TabPanel>

          <TabPanel>
            <div>
              <h3 className="text-xl font-semibold mb-4">Historial de transacciones</h3>
              
              {loadingTransactions ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">Cargando transacciones...</p>
                </div>
              ) : (
                <>
                  {transactionsData && transactionsData.transactions && transactionsData.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descripción
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Monto
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Saldo resultante
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactionsData.transactions.map(transaction => (
                            <tr key={transaction._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 
                                  transaction.type === 'charge' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'}`}
                                >
                                  {transaction.type === 'deposit' ? 'Recarga' : 
                                   transaction.type === 'charge' ? 'Cargo' : 
                                   transaction.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                                  {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${(transaction.balanceAfter || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No hay transacciones disponibles
                    </div>
                  )}
                </>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default BalancePage;
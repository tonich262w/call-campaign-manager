import React, { useState, useEffect } from 'react';

// Componente actualizado para el sistema de administración de saldo con costos inflados y soporte Stripe
const AdminBalanceSystemWithStripe = () => {
  const [systemStats, setSystemStats] = useState({
    totalRealCost: 325.00,
    totalChargedAmount: 650.00,
    profits: 325.00,
    userRecharges: 1000.00,
    availableBalance: 350.00,
    stripeRecharges: 450.00,
    manualRecharges: 550.00,
    stripeCommissions: 13.50 // 3% aproximado de comisión
  });
  
  const [showRealNumbers, setShowRealNumbers] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Lista de transacciones del sistema
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2025-03-15',
      userId: 101,
      userName: 'Cliente Empresa A',
      type: 'recharge',
      method: 'manual',
      realAmount: 200.00,
      chargedAmount: 200.00,
      profit: 0,
      status: 'completed',
      notes: 'Recarga por transferencia bancaria'
    },
    {
      id: 2,
      date: '2025-03-17',
      userId: 101,
      userName: 'Cliente Empresa A',
      type: 'call_expense',
      campaignName: 'Campaña Ventas Q1',
      calls: 750,
      realAmount: 37.50, // Costo real por llamada ($0.05)
      chargedAmount: 75.00, // Costo inflado ($0.10)
      profit: 37.50,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-04-01',
      userId: 102,
      userName: 'Cliente Empresa B',
      type: 'recharge',
      method: 'stripe',
      realAmount: 150.00,
      chargedAmount: 150.00,
      commission: 4.50, // Comisión de Stripe (3%)
      profit: -4.50, // Pérdida por la comisión
      status: 'completed',
      notes: 'Recarga con tarjeta (Stripe)'
    },
    {
      id: 4, 
      date: '2025-04-10',
      userId: 102,
      userName: 'Cliente Empresa B',
      type: 'call_expense',
      campaignName: 'Seguimiento Clientes',
      calls: 250,
      realAmount: 12.50, // Costo real ($0.05)
      chargedAmount: 25.00, // Costo inflado ($0.10)
      profit: 12.50,
      status: 'completed'
    },
    {
      id: 5,
      date: '2025-04-20',
      userId: 103,
      userName: 'Cliente Empresa C',
      type: 'recharge',
      method: 'stripe',
      realAmount: 300.00,
      chargedAmount: 300.00,
      commission: 9.00, // Comisión de Stripe (3%)
      profit: -9.00, // Pérdida por la comisión
      status: 'completed',
      notes: 'Recarga con tarjeta (Stripe)'
    }
  ]);
  
  // Verificar contraseña y mostrar datos reales
  const handlePasswordCheck = (e) => {
    e.preventDefault();
    // Contraseña de administrador para ver los datos reales
    if (password === 'admin123') {
      setShowRealNumbers(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };
  
  // Configuración del sistema
  const [settings, setSettings] = useState({
    inflationRate: 2.0, // Multiplicador de costos (2x)
    realCallCost: 0.05, // Costo real por llamada
    chargedCallCost: 0.10, // Costo que se cobra al cliente
    minRechargeAmount: 50.00, // Monto mínimo de recarga
    stripeEnabled: true, // Habilitar pagos con Stripe
    stripeCommissionRate: 0.03 // 3% de comisión de Stripe
  });
  
  // Actualizar la configuración
  const updateSettings = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para actualizar la configuración en la base de datos
    alert("Configuración actualizada");
  };
  
  // Añadir recarga manual
  const [rechargeData, setRechargeData] = useState({
    userId: '',
    amount: '',
    method: 'manual', // manual o stripe
    notes: ''
  });
  
  const handleRechargeChange = (e) => {
    const { name, value } = e.target;
    setRechargeData({
      ...rechargeData,
      [name]: value
    });
  };
  
  const handleRechargeSubmit = (e) => {
    e.preventDefault();
    
    if (!rechargeData.userId || !rechargeData.amount || isNaN(rechargeData.amount)) {
      alert("Por favor, complete todos los campos correctamente");
      return;
    }
    
    const amount = parseFloat(rechargeData.amount);
    let commission = 0;
    let profit = 0;
    
    // Calcular comisión si es pago con Stripe
    if (rechargeData.method === 'stripe') {
      commission = amount * settings.stripeCommissionRate;
      profit = -commission; // Pérdida por la comisión
    }
    
    // Nueva transacción de recarga
    const newTransaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      userId: parseInt(rechargeData.userId),
      userName: `Cliente ID: ${rechargeData.userId}`,
      type: 'recharge',
      method: rechargeData.method,
      realAmount: amount,
      chargedAmount: amount, // No hay inflación en las recargas
      commission: commission,
      profit: profit,
      status: 'completed',
      notes: rechargeData.notes || `Recarga ${rechargeData.method === 'stripe' ? 'con tarjeta (Stripe)' : 'manual'}`
    };
    
    // Actualizar transacciones y estadísticas
    setTransactions([newTransaction, ...transactions]);
    
    // Actualizar estadísticas según el método de pago
    if (rechargeData.method === 'stripe') {
      setSystemStats({
        ...systemStats,
        userRecharges: systemStats.userRecharges + amount,
        availableBalance: systemStats.availableBalance + amount,
        stripeRecharges: systemStats.stripeRecharges + amount,
        stripeCommissions: systemStats.stripeCommissions + commission
      });
    } else {
      setSystemStats({
        ...systemStats,
        userRecharges: systemStats.userRecharges + amount,
        availableBalance: systemStats.availableBalance + amount,
        manualRecharges: systemStats.manualRecharges + amount
      });
    }
    
    // Limpiar formulario
    setRechargeData({
      userId: '',
      amount: '',
      method: 'manual',
      notes: ''
    });
    
    alert(`Recarga de $${amount.toFixed(2)} realizada con éxito para el usuario ${rechargeData.userId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Panel de Administración de Saldo</h1>
      
      {/* Auth para mostrar datos reales */}
      {!showRealNumbers && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acceso a datos reales</h2>
          <form onSubmit={handlePasswordCheck} className="flex space-x-4">
            <div className="flex-grow">
              <input
                type="password"
                placeholder="Ingrese contraseña de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Acceder
            </button>
          </form>
        </div>
      )}
      
      {/* Resumen financiero */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen Financiero</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Recargas</p>
              <p className="text-2xl font-bold text-blue-600">${systemStats.userRecharges.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Saldo Disponible</p>
              <p className="text-2xl font-bold text-green-600">${systemStats.availableBalance.toFixed(2)}</p>
            </div>
            
            {showRealNumbers && (
              <>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Costo Real Acumulado</p>
                  <p className="text-2xl font-bold text-indigo-600">${systemStats.totalRealCost.toFixed(2)}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">${systemStats.profits.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Ganancias Totales</p>
                </div>
              </>
            )}
          </div>
          
          {/* Desglose por método de pago (solo visible con datos reales) */}
          {showRealNumbers && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Desglose por Método de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Recargas Manuales</p>
                  <p className="text-xl font-bold text-yellow-600">${systemStats.manualRecharges.toFixed(2)}</p>
                </div>
                
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Recargas Stripe</p>
                  <p className="text-xl font-bold text-pink-600">${systemStats.stripeRecharges.toFixed(2)}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Comisiones Stripe</p>
                  <p className="text-xl font-bold text-red-600">-${systemStats.stripeCommissions.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Configuración del sistema */}
      {showRealNumbers && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Costos</h2>
            
            <form onSubmit={updateSettings}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo real por llamada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.realCallCost}
                    onChange={(e) => setSettings({...settings, realCallCost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo cobrado por llamada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.chargedCallCost}
                    onChange={(e) => setSettings({...settings, chargedCallCost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Multiplicador de costo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={settings.inflationRate}
                    onChange={(e) => setSettings({...settings, inflationRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto mínimo de recarga ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={settings.minRechargeAmount}
                    onChange={(e) => setSettings({...settings, minRechargeAmount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comisión de Stripe (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.stripeCommissionRate * 100}
                    onChange={(e) => setSettings({...settings, stripeCommissionRate: parseFloat(e.target.value) / 100})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={settings.stripeEnabled}
                      onChange={(e) => setSettings({...settings, stripeEnabled: e.target.checked})}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Habilitar pagos con Stripe
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Añadir recarga manual */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Recarga</h2>
          
          <form onSubmit={handleRechargeSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Usuario
                </label>
                <input
                  type="text"
                  name="userId"
                  value={rechargeData.userId}
                  onChange={handleRechargeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min={settings.minRechargeAmount}
                  value={rechargeData.amount}
                  onChange={handleRechargeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  name="method"
                  value={rechargeData.method}
                  onChange={handleRechargeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="manual">Transferencia Manual</option>
                  <option value="stripe">Tarjeta (Stripe)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <input
                  type="text"
                  name="notes"
                  value={rechargeData.notes}
                  onChange={handleRechargeChange}
                  placeholder="Ej: Transferencia #12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Registrar Recarga
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Historial de transacciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Cobrado
                </th>
                {showRealNumbers && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ganancia
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'recharge' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'recharge' ? 'Recarga' : 'Consumo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type === 'recharge' 
                      ? (transaction.method === 'stripe' 
                          ? 'Stripe' 
                          : 'Manual')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.chargedAmount.toFixed(2)}
                  </td>
                  {showRealNumbers && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.realAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.commission 
                          ? `$${transaction.commission.toFixed(2)}` 
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.profit.toFixed(2)}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type === 'recharge' 
                      ? transaction.notes 
                      : `${transaction.campaignName} (${transaction.calls} llamadas)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBalanceSystemWithStripe;
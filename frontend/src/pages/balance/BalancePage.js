Vamos a implementar la funcionalidad de balance/saldo para que los usuarios puedan gestionar sus créditos y costos de llamadas. Actualicemos el componente BalancePage para incluir:

1. Información general del saldo disponible
2. Historial de transacciones
3. Opciones para recargar saldo
4. Detalles de costos por campaña

## Actualización del componente BalancePage

```jsx
// Actualiza el componente BalancePage en App.js
const BalancePage = () => {
  const [balance, setBalance] = useState({
    currentBalance: 250.00,
    totalSpent: 750.00,
    callRate: 0.05, // $0.05 por llamada
    callMinuteRate: 0.02 // $0.02 por minuto adicional
  });
  
  const [transactions, setTransactions] = useState([
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
  
  const [campaignCosts, setCampaignCosts] = useState([
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
  
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Simulación de recarga de saldo
  const handleRecharge = async (e) => {
    e.preventDefault();
    
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulamos la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(rechargeAmount);
      
      // Actualizar saldo
      setBalance(prev => ({
        ...prev,
        currentBalance: prev.currentBalance + amount
      }));
      
      // Añadir nueva transacción
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: 'charge',
        amount: amount,
        description: 'Recarga de saldo',
        status: 'completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      setSuccess(Recarga de $${amount.toFixed(2)} realizada con éxito);
      setRechargeAmount('');
    } catch (err) {
      console.error('Error al realizar la recarga:', err);
      setError('No se pudo completar la recarga. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Saldo</h1>
      
      {/* Resumen de saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Saldo Disponible</h2>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-blue-600">${balance.currentBalance.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 mt-2">
              Has gastado un total de ${balance.totalSpent.toFixed(2)} en llamadas
            </p>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Tarifas actuales</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Llamada:</span> ${balance.callRate.toFixed(2)} por llamada
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Minuto adicional:</span> ${balance.callMinuteRate.toFixed(2)} por minuto
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recargar Saldo</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{success}</span>
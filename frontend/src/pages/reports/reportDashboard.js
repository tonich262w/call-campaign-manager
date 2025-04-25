import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Componente para el dashboard de reportes
const ReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [callsByDay, setCallsByDay] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [period, setPeriod] = useState('month');

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    new: '#3b82f6',         // Azul
    contacted: '#f59e0b',   // Amarillo
    qualified: '#10b981',   // Verde
    unqualified: '#ef4444', // Rojo
    converted: '#8b5cf6'    // Morado
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar estadísticas generales
        const statsResponse = await fetch('/api/reports/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Cargar gráfico de llamadas por día
        const callsResponse = await fetch('/api/reports/calls-by-day', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Cargar llamadas recientes
        const recentResponse = await fetch('/api/reports/recent-calls', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Cargar datos financieros
        const financialResponse = await fetch('/api/reports/financial', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!statsResponse.ok || !callsResponse.ok || !recentResponse.ok || !financialResponse.ok) {
          throw new Error('Error al cargar datos');
        }
        
        const statsData = await statsResponse.json();
        const callsData = await callsResponse.json();
        const recentData = await recentResponse.json();
        const financialData = await financialResponse.json();
        
        setStats(statsData);
        setCallsByDay(callsData);
        setRecentCalls(recentData);
        setFinancialData(financialData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos. Por favor, inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Función para cargar reporte de rendimiento
  const loadPerformanceReport = async (selectedPeriod) => {
    setPeriod(selectedPeriod);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/reports/performance?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar reporte de rendimiento');
      }
      
      const data = await response.json();
      // Aquí puedes actualizar el estado con los datos de rendimiento
      console.log('Reporte de rendimiento:', data);
      
    } catch (err) {
      console.error('Error al cargar reporte de rendimiento:', err);
      setError('No se pudo cargar el reporte de rendimiento');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  // Preparar datos para el gráfico de estados de leads (si stats está disponible)
  const leadStatusData = stats ? [
    { name: 'Nuevos', value: stats.totalLeads - stats.processedLeads },
    { name: 'Procesados', value: stats.processedLeads - stats.successfulCalls },
    { name: 'Exitosos', value: stats.successfulCalls }
  ] : [];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard de Reportes</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Campañas Activas</h3>
          <p className="text-2xl font-bold text-blue-600">{stats?.activeCampaigns || 0}</p>
          <p className="text-gray-500 text-sm">de {stats?.totalCampaigns || 0} campañas</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Total de Leads</h3>
          <p className="text-2xl font-bold text-green-600">{stats?.totalLeads || 0}</p>
          <p className="text-gray-500 text-sm">{stats?.processedLeads || 0} procesados</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Tasa de Éxito</h3>
          <p className="text-2xl font-bold text-purple-600">{stats?.successRate || 0}%</p>
          <p className="text-gray-500 text-sm">{stats?.successfulCalls || 0} llamadas exitosas</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Saldo Actual</h3>
          <p className="text-2xl font-bold text-indigo-600">${financialData?.currentBalance.toFixed(2) || 0}</p>
          <p className="text-gray-500 text-sm">Gastado: ${financialData?.totalSpent.toFixed(2) || 0}</p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Llamadas por Día */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Llamadas por Día</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={callsByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" name="Llamadas" />
                <Line type="monotone" dataKey="successful" stroke="#10b981" name="Exitosas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de Estado de Leads */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Leads</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Llamadas Recientes */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Llamadas Recientes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intentos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.map((call) => (
                <tr key={call.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{call.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${call.status === 'converted' ? 'green' : call.status === 'qualified' ? 'blue' : call.status === 'contacted' ? 'yellow' : 'gray'}-100 text-${call.status === 'converted' ? 'green' : call.status === 'qualified' ? 'blue' : call.status === 'contacted' ? 'yellow' : 'gray'}-800`}>
                      {call.status === 'new' ? 'Nuevo' : 
                       call.status === 'contacted' ? 'Contactado' : 
                       call.status === 'qualified' ? 'Calificado' : 
                       call.status === 'unqualified' ? 'No calificado' : 
                       'Convertido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.attempts}
                  </td>
                </tr>
              ))}
              
              {recentCalls.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay llamadas recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Selección de período para reporte de rendimiento */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reporte de Rendimiento</h3>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => loadPerformanceReport('month')}
            className={`px-4 py-2 rounded-md ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Último Mes
          </button>
          <button
            onClick={() => loadPerformanceReport('quarter')}
            className={`px-4 py-2 rounded-md ${period === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Último Trimestre
          </button>
          <button
            onClick={() => loadPerformanceReport('year')}
            className={`px-4 py-2 rounded-md ${period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Último Año
          </button>
        </div>
        
        <p className="text-gray-500">
          Seleccione un período para ver el reporte de rendimiento detallado.
        </p>
      </div>
    </div>
  );
};

export default ReportDashboard;
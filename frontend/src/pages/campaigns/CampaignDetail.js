 2. Implementando la vista detallada de campañas

Ahora, vamos a crear un nuevo componente CampaignDetail para ver los detalles de una campaña específica:

jsx
// Agrega este componente al final de App.js, antes de la función App principal
const CampaignDetail = () => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simulamos la carga de datos de una campaña
  useEffect(() => {
    // Simular retraso de carga
    const timer = setTimeout(() => {
      // Datos de ejemplo
      setCampaign({
        id: '1',
        name: 'Campaña Ventas Q1',
        description: 'Campaña para aumentar ventas en el primer trimestre',
        startDate: '2025-01-15',
        endDate: '2025-03-31',
        status: 'active',
        timezone: 'GMT-5',
        callHoursStart: '09:00',
        callHoursEnd: '18:00',
        callDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        maxAttempts: 3,
        callScript: 'Hola, mi nombre es [Nombre del Agente]. Estoy llamando de parte de [Empresa]. Nos gustaría hablarle de nuestros nuevos productos...',
        targetAudience: 'Empresas pequeñas y medianas en el sector tecnológico',
        totalLeads: 350,
        completedCalls: 208,
        successfulCalls: 76
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  if (!campaign) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No se encontró la campaña solicitada.</span>
      </div>
    );
  }
  
  // Calcular tasa de conversión
  const conversionRate = campaign.totalLeads > 0 
    ? Math.round((campaign.successfulCalls / campaign.totalLeads) * 100) 
    : 0;
  
  // Calcular progreso de llamadas
  const callProgress = campaign.totalLeads > 0 
    ? Math.round((campaign.completedCalls / campaign.totalLeads) * 100) 
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Encabezado con acciones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Detalles de la Campaña</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => window.location.href = `/campaigns/${campaign.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Editar
          </button>
          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
                // Aquí iría la lógica para eliminar
                window.location.href = '/campaigns';
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      {/* Detalles básicos */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h2>
              <p className="text-gray-600">{campaign.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {campaign.status === 'active' ? 'Activa' : 
               campaign.status === 'paused' ? 'Pausada' : 'Borrador'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Fecha de inicio</h3>
              <p className="text-gray-800">{new Date(campaign.startDate).toLocaleDateString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Fecha de finalización</h3>
              <p className="text-gray-800">{new Date(campaign.endDate).toLocaleDateString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Horario de llamadas</h3>
              <p className="text-gray-800">{campaign.callHoursStart} - {campaign.callHoursEnd}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Zona horaria</h3>
              <p className="text-gray-800">{campaign.timezone}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Días de llamadas</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(campaign.callDays).map(([day, active]) => (
                <span 
                  key={day}
                  className={`px-3 py-1 rounded-full text-sm ${
                    active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Público objetivo</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{campaign.targetAudience}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Guion de llamada</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.callScript}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estadísticas de la campaña */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de la Campaña</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total de contactos</h3>
              <p className="text-2xl font-bold text-blue-700">{campaign.totalLeads}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Llamadas completadas</h3>
              <p className="text-2xl font-bold text-green-700">{campaign.completedCalls}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Llamadas exitosas</h3>
              <p className="text-2xl font-bold text-purple-700">{campaign.successfulCalls}</p>
              <p className="text-sm text-purple-500">Tasa de conversión: {conversionRate}%</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Progreso de llamadas</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-blue-600 h-4 rounded-full" 
                style={{ width: `${callProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{campaign.completedCalls} completadas</span>
              <span>{campaign.totalLeads - campaign.completedCalls} pendientes</span>
            </div>
          </div>
        </div>
      </div>
      useEffect(() => {
  const timer = setTimeout(() => {
    setCampaign({
      // ... (datos de la campaña)
    });
    
    // Carga de leads para la campaña (simula la llamada a la API)
    Lead.getByCampaign(1) // Asumimos que estamos viendo la campaña con ID 1
      .then(leadsData => {
        setLeads(leadsData);
      })
      .catch(err => {
        console.error('Error al cargar leads:', err);
      });
    
    setLoading(false);
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);

// Y añade un estado para los leads
const [leads, setLeads] = useState([]);

// Luego, en la sección de contactos de la campaña, actualiza el contenido:
<div className="bg-white shadow rounded-lg overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="text-lg font-semibold text-gray-800">Contactos de la Campaña</h2>
    <button 
      onClick={() => window.location.href = `/campaigns/${campaign.id}/leads/import`}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
    >
      Importar Contactos
    </button>
  </div>
  
  {leads.length === 0 ? (
    <div className="p-6 text-center text-gray-500">
      <p>No hay contactos asociados a esta campaña.</p>
      <button 
        onClick={() => window.location.href = `/campaigns/${campaign.id}/leads/import`}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Importar contactos
      </button>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map(lead => (
            <tr key={lead.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{lead.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{lead.phone || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[lead.status || 'new']
                }`}>
                  {statusLabels[lead.status || 'new']}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.location.href = `/leads/${lead.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => window.location.href = `/leads/${lead.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Sección para futuros contactos/leads */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Contactos de la Campaña</h2>
          <button 
            onClick={() => alert('Funcionalidad en desarrollo')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Contactos
          </button>
        </div>
        
        <div className="p-6 text-center text-gray-500">
          <p>La gestión de contactos estará disponible próximamente.</p>
          <p className="mt-2">Podrás importar contactos, ver su estado y gestionar las llamadas.</p>
        </div>
      </div>
    </div>
  );
};

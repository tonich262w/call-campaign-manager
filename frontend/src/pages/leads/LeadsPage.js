const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Status colors y labels para los diferentes estados
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800'
  };
  
  const statusLabels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No calificado',
    converted: 'Convertido'
  };
  
  // Cargar los leads al montar el componente
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsData = await Lead.getAll();
        setLeads(leadsData);
      } catch (err) {
        console.error('Error al cargar los leads:', err);
        setError('No se pudieron cargar los leads. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  // Manejar el cambio de estado de un lead
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await Lead.update(leadId, { status: newStatus });
      // Actualizar el estado local
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
      setError('No se pudo actualizar el estado del lead.');
    }
  };
  
  // Manejar la eliminación de un lead
  const handleDelete = async (leadId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este lead?')) {
      try {
        await Lead.delete(leadId);
        setLeads(leads.filter(lead => lead.id !== leadId));
      } catch (err) {
        console.error('Error al eliminar el lead:', err);
        setError('No se pudo eliminar el lead.');
      }
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Listado de Leads</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '/leads/import'}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Leads
          </button>
          <button 
            onClick={() => window.location.href = '/leads/new'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Nuevo Lead
          </button>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 text-lg mb-4">No hay leads disponibles</p>
          <button 
            onClick={() => window.location.href = '/leads/import'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Leads
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaña
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.company || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={lead.status || 'new'} 
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-sm font-medium px-2 py-1 rounded-full ${statusColors[lead.status || 'new']}`}
                    >
                      {Object.keys(statusLabels).map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {lead.campaignName || 'Sin campaña'}
                    </div>
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
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
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
  );
};


const ImportLeadsPage = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Campaña Ventas Q1' },
    { id: 2, name: 'Seguimiento Clientes' }
  ]);
  
  // Manejar la selección del archivo CSV
  const handleFileChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor, seleccione un archivo CSV válido');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvData(text);
      parseCSV(text);
    };
    
    reader.readAsText(file);
  };
  
  // Analizar los datos CSV
  const parseCSV = (text) => {
    try {
      // Implementación simplificada del análisis CSV
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        const values = rows[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      }
      
      setParsedData(data);
    } catch (err) {
      console.error('Error al analizar el CSV:', err);
      setError('No se pudo analizar el archivo CSV. Verifique el formato.');
    }
  };
  
  // Manejar la importación de leads
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign) {
      setError('Por favor, seleccione una campaña');
      return;
    }
    
    if (parsedData.length === 0) {
      setError('No hay datos para importar');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Asumimos que el modelo Lead tiene un método para importar leads
      const result = await Lead.importLeads(selectedCampaign, parsedData);
      setSuccess(`Se importaron ${result.count} leads correctamente`);
      
      // Limpiar datos
      setCsvData('');
      setParsedData([]);
      document.getElementById('csv-file').value = '';
    } catch (err) {
      console.error('Error al importar leads:', err);
      setError('Ocurrió un error al importar los leads');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Importar Leads</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form onSubmit={handleImport}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="campaign">
              Campaña *
            </label>
            <select
              id="campaign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              required
            >
              <option value="">Seleccione una campaña</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Seleccione la campaña a la que desea importar los leads
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="csv-file">
              Archivo CSV *
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv, text/csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              El archivo debe contener al menos las columnas: name, email, phone
            </p>
          </div>
          
          {parsedData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Vista previa ({parsedData.length} registros)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(parsedData[0]).map(header => (
                        <th 
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                      <tr>
                        <td 
                          colSpan={Object.keys(parsedData[0]).length} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                        >
                          ... {parsedData.length - 5} más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.location.href = '/leads'}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || parsedData.length === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Importando...' : 'Importar Leads'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Formato del archivo CSV</h2>
        <p className="mb-4">El archivo CSV debe tener el siguiente formato:</p>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <code>name,email,phone,company</code><br />
          <code>Juan Pérez,juan@ejemplo.com,+123456789,Empresa ABC</code><br />
          <code>María López,maria@ejemplo.com,+987654321,Empresa XYZ</code>
        </div>
      </div>
    </div>
  );
};


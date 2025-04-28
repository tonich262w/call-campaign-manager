// src/pages/campaigns/ImportLeadsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Campaign, Lead } from '../../services/apiService';
import Papa from 'papaparse';

const ImportLeadsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState(null);
  const [importStatus, setImportStatus] = useState({
    processing: false,
    success: false,
    error: null,
    total: 0,
    imported: 0
  });
  
  // Campos que se pueden importar
  const availableFields = [
    { key: 'name', label: 'Nombre', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Teléfono', required: true },
    { key: 'company', label: 'Empresa', required: false },
    { key: 'position', label: 'Cargo', required: false },
    { key: 'notes', label: 'Notas', required: false }
  ];
  
  // Estado para el mapeo de campos
  const [fieldMapping, setFieldMapping] = useState({});
  
  // Cargar datos de la campaña
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const campaignData = await Campaign.getById(id);
        setCampaign(campaignData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener detalles de la campaña:', error);
        setError('No se pudo cargar la información de la campaña. Inténtelo de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchCampaignDetails();
  }, [id]);
  
  // Manejar la carga del archivo CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError(null);
    
    // Verificar tipo de archivo
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Solo se permiten archivos CSV');
      return;
    }
    
    // Parsear el archivo CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error al procesar el archivo: ${results.errors[0].message}`);
          return;
        }
        
        if (results.data.length === 0) {
          setError('El archivo no contiene datos');
          return;
        }
        
        // Obtener las columnas del CSV
        const columns = Object.keys(results.data[0]);
        
        // Inicializar el mapeo de campos automáticamente si es posible
        const initialMapping = {};
        availableFields.forEach(field => {
          // Buscar columnas que coincidan con el nombre del campo (ignorando mayúsculas/minúsculas)
          const matchingColumn = columns.find(
            col => col.toLowerCase() === field.key.toLowerCase() ||
                  col.toLowerCase().includes(field.key.toLowerCase())
          );
          
          if (matchingColumn) {
            initialMapping[field.key] = matchingColumn;
          }
        });
        
        setFieldMapping(initialMapping);
        setFileData(results.data);
      }
    });
  };
  
  // Manejar el cambio en el mapeo de campos
  const handleMappingChange = (fieldKey, columnName) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: columnName
    }));
  };
  
  // Validar el mapeo de campos
  const validateMapping = () => {
    const errors = [];
    
    // Verificar que los campos requeridos estén mapeados
    availableFields.forEach(field => {
      if (field.required && !fieldMapping[field.key]) {
        errors.push(`El campo ${field.label} es obligatorio y debe estar mapeado a una columna del CSV.`);
      }
    });
    
    return errors;
  };
  
  // Procesar y enviar los contactos
  const processImport = async () => {
    // Validar el mapeo
    const validationErrors = validateMapping();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }
    
    setImportStatus({
      processing: true,
      success: false,
      error: null,
      total: fileData.length,
      imported: 0
    });
    
    try {
      // Transformar los datos según el mapeo
      const leads = fileData.map(row => {
        const lead = {};
        Object.entries(fieldMapping).forEach(([fieldKey, columnName]) => {
          if (columnName) {
            lead[fieldKey] = row[columnName];
          }
        });
        
        // Añadir el ID de la campaña
        lead.campaignId = id;
        
        return lead;
      });
      
      // Enviar los contactos al servidor
      const response = await Lead.importLeads(id, leads);
      
      setImportStatus({
        processing: false,
        success: true,
        error: null,
        total: fileData.length,
        imported: response.imported || leads.length
      });
      
      // Retrasar la navegación para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate(`/campaigns/${id}`);
      }, 3000);
      
    } catch (error) {
      console.error('Error al importar contactos:', error);
      setImportStatus({
        processing: false,
        success: false,
        error: 'Error al importar contactos. Intente nuevamente.',
        total: fileData.length,
        imported: 0
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !fileData.length) {
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Importar Contactos</h1>
        <div>
          <span className="text-gray-600 mr-2">Campaña:</span>
          <span className="font-medium">{campaign.name}</span>
        </div>
      </div>
      
      {/* Proceso de importación */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          {!fileData.length ? (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Paso 1: Seleccionar archivo CSV</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Sube un archivo CSV con los contactos a importar. El archivo debe contener al menos las columnas para nombre y teléfono.
                </p>
                
                <label className="block">
                  <span className="sr-only">Seleccionar archivo</span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                    "
                  />
                </label>
              </div>
              
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Formato esperado</h3>
                <p className="text-sm text-blue-700">
                  El archivo CSV debe tener una fila de encabezado con los nombres de las columnas.
                  Se recomienda incluir al menos las siguientes columnas: Nombre, Teléfono y Email.
                </p>
              </div>
            </div>
          ) : importStatus.processing || importStatus.success ? (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {importStatus.success ? 'Importación Completada' : 'Procesando Importación'}
              </h2>
              
              {importStatus.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{importStatus.error}</span>
                </div>
              )}
              
              {importStatus.success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">
                    Se han importado {importStatus.imported} de {importStatus.total} contactos exitosamente.
                    Redirigiendo a la página de la campaña...
                  </span>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ width: `${(importStatus.imported / importStatus.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-center mt-2 text-gray-600">
                      Procesando {importStatus.imported} de {importStatus.total} contactos
                    </p>
                  </div>
                  <p className="text-gray-600">
                    Por favor, espere mientras se procesan los contactos. No cierre esta página.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Paso 2: Mapear campos</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <p className="text-gray-600 mb-4">
                Se han detectado {fileData.length} registros en el archivo. 
                Selecciona qué columna del CSV corresponde a cada campo en el sistema.
              </p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campo en el Sistema
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Columna en el CSV
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obligatorio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vista Previa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableFields.map(field => (
                      <tr key={field.key}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{field.label}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={fieldMapping[field.key] || ''}
                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                          >
                            <option value="">-- Seleccionar --</option>
                            {Object.keys(fileData[0]).map(column => (
                              <option key={column} value={column}>{column}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {field.required ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Sí
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fieldMapping[field.key] ? (
                            <span className="text-sm text-gray-500">
                              {fileData[0][fieldMapping[field.key]]}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => {
                    setFileData([]);
                    setFieldMapping({});
                  }}
                >
                  Volver
                </button>
                
                <button 
                  type="button" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={processImport}
                >
                  Iniciar Importación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instrucciones */}
      {!fileData.length && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Instrucciones</h2>
          </div>
          
          <div className="p-6">
            <ol className="list-decimal pl-5 space-y-2">
              <li className="text-gray-700">
                <span className="font-medium">Preparar el archivo CSV</span>: Crea un archivo CSV con tus contactos. Asegúrate de incluir una fila de encabezado con los nombres de las columnas.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Subir el archivo</span>: Selecciona el archivo CSV desde tu computadora.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Mapear los campos</span>: Indica qué columna del CSV corresponde a cada campo en el sistema.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Iniciar la importación</span>: Una vez configurado el mapeo, inicia la importación.
              </li>
            </ol>
            
            <div className="mt-6 bg-yellow-50 p-4 rounded">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Importante</h3>
              <p className="text-sm text-yellow-700">
                Los campos marcados como obligatorios deben estar presentes en el archivo CSV.
                Los teléfonos deben incluir el código de país (ej. +1 555 123 4567).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportLeadsPage;

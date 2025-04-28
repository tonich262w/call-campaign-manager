// src/pages/campaigns/EditCampaignPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Campaign } from '../../services/apiService';

const EditCampaignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
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
    callScript: '',
    targetAudience: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos de la campaña al montar el componente
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        console.log('Obteniendo detalles de campaña con ID:', id);
        const campaignData = await Campaign.getById(id);
        console.log('Datos de campaña obtenidos:', campaignData);
        
        // Formatear fechas para el formulario
        const formattedData = {
          ...campaignData,
          startDate: campaignData.startDate ? new Date(campaignData.startDate).toISOString().split('T')[0] : '',
          endDate: campaignData.endDate ? new Date(campaignData.endDate).toISOString().split('T')[0] : '',
          // Asegurarnos de que callDays tenga la estructura correcta
          callDays: campaignData.callDays || {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          }
        };
        
        setFormData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener detalles de la campaña:', error);
        setError('No se pudo cargar la información de la campaña. Inténtelo de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchCampaignDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      callDays: {
        ...prevState.callDays,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    if (!formData.endDate) newErrors.endDate = 'La fecha de finalización es obligatoria';
    if (formData.endDate < formData.startDate) newErrors.endDate = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    
    const hasSelectedDay = Object.values(formData.callDays).some(day => day);
    if (!hasSelectedDay) newErrors.callDays = 'Debes seleccionar al menos un día';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Formatear los datos para el backend
      const campaignData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timezone: formData.timezone,
        callHoursStart: formData.callHoursStart,
        callHoursEnd: formData.callHoursEnd,
        callDays: formData.callDays,
        maxAttempts: parseInt(formData.maxAttempts),
        callScript: formData.callScript,
        targetAudience: formData.targetAudience
      };
      
      // Llamar a la API para actualizar la campaña
      await Campaign.update(id, campaignData);
      
      alert('¡Campaña actualizada exitosamente!');
      navigate(`/campaigns/${id}`);
    } catch (error) {
      console.error('Error al actualizar la campaña:', error);
      setErrors({ form: 'Error al actualizar la campaña. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => {
    navigate(`/campaigns/${id}`);
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
    <div className="campaign-form-container">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Campaña</h2>
      
      {errors.form && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errors.form}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Información Básica</h3>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          
          <div className="flex flex-wrap -mx-3 mb-4">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs italic">{errors.startDate}</p>}
            </div>
            
            <div className="w-full md:w-1/2 px-3">
              <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">
                Fecha de Finalización *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.endDate ? 'border-red-500' : ''}`}
              />
              {errors.endDate && <p className="text-red-500 text-xs italic">{errors.endDate}</p>}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Configuración de Llamadas</h3>
          
          <div className="flex flex-wrap -mx-3 mb-4">
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label htmlFor="timezone" className="block text-gray-700 text-sm font-bold mb-2">
                Zona Horaria
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="GMT-8">GMT-8 (PST)</option>
                <option value="GMT-7">GMT-7 (MST)</option>
                <option value="GMT-6">GMT-6 (CST)</option>
                <option value="GMT-5">GMT-5 (EST)</option>
                <option value="GMT+0">GMT+0 (UTC)</option>
                <option value="GMT+1">GMT+1 (CET)</option>
                <option value="GMT+2">GMT+2 (EET)</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label htmlFor="callHoursStart" className="block text-gray-700 text-sm font-bold mb-2">
                Hora de Inicio
              </label>
              <input
                type="time"
                id="callHoursStart"
                name="callHoursStart"
                value={formData.callHoursStart}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="w-full md:w-1/3 px-3">
              <label htmlFor="callHoursEnd" className="block text-gray-700 text-sm font-bold mb-2">
                Hora de Finalización
              </label>
              <input
                type="time"
                id="callHoursEnd"
                name="callHoursEnd"
                value={formData.callHoursEnd}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Días de Llamada *
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="monday" 
                  checked={formData.callDays.monday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Lunes</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="tuesday" 
                  checked={formData.callDays.tuesday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Martes</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="wednesday" 
                  checked={formData.callDays.wednesday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Miércoles</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="thursday" 
                  checked={formData.callDays.thursday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Jueves</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="friday" 
                  checked={formData.callDays.friday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Viernes</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="saturday" 
                  checked={formData.callDays.saturday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Sábado</span>
              </label>
              
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="sunday" 
                  checked={formData.callDays.sunday} 
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Domingo</span>
              </label>
            </div>
            {errors.callDays && <p className="text-red-500 text-xs italic">{errors.callDays}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="maxAttempts" className="block text-gray-700 text-sm font-bold mb-2">
              Número Máximo de Intentos
            </label>
            <input
              type="number"
              id="maxAttempts"
              name="maxAttempts"
              min="1"
              max="10"
              value={formData.maxAttempts}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Contenido de la Campaña</h3>
          
          <div className="mb-4">
            <label htmlFor="callScript" className="block text-gray-700 text-sm font-bold mb-2">
              Guion de Llamada
            </label>
            <textarea
              id="callScript"
              name="callScript"
              rows="5"
              value={formData.callScript}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ej: Hola, mi nombre es [Nombre del Agente]. Estoy llamando de parte de [Empresa]..."
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="targetAudience" className="block text-gray-700 text-sm font-bold mb-2">
              Público Objetivo
            </label>
            <textarea
              id="targetAudience"
              name="targetAudience"
              rows="3"
              value={formData.targetAudience}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Describe brevemente el perfil de las personas a las que va dirigida esta campaña"
            ></textarea>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            type="button" 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={cancelForm}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCampaignPage;

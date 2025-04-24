import axios from 'axios';
import { API_URL } from '../config';

// Obtener el token de autenticación del almacenamiento local
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configurar los encabezados de autenticación
const authHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener todas las campañas
export const getCampaigns = async () => {
  try {
    const response = await axios.get(`${API_URL}/campaigns`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    throw error;
  }
};

// Crear una nueva campaña
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(`${API_URL}/campaigns`, campaignData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear campaña:', error);
    throw error;
  }
};

// Obtener una campaña por ID
export const getCampaignById = async (campaignId) => {
  try {
    const response = await axios.get(`${API_URL}/campaigns/${campaignId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener campaña con ID ${campaignId}:`, error);
    throw error;
  }
};

// Actualizar una campaña
export const updateCampaign = async (campaignId, campaignData) => {
  try {
    const response = await axios.put(`${API_URL}/campaigns/${campaignId}`, campaignData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar campaña con ID ${campaignId}:`, error);
    throw error;
  }
};

// Eliminar una campaña
export const deleteCampaign = async (campaignId) => {
  try {
    const response = await axios.delete(`${API_URL}/campaigns/${campaignId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar campaña con ID ${campaignId}:`, error);
    throw error;
  }
};

// Pausar una campaña
export const pauseCampaign = async (campaignId) => {
  try {
    const response = await axios.put(`${API_URL}/campaigns/${campaignId}/pause`, {}, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error al pausar campaña con ID ${campaignId}:`, error);
    throw error;
  }
};

// Reanudar una campaña
export const resumeCampaign = async (campaignId) => {
  try {
    const response = await axios.put(`${API_URL}/campaigns/${campaignId}/resume`, {}, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error al reanudar campaña con ID ${campaignId}:`, error);
    throw error;
  }
};


## Paso 7: Actualizar el componente CampaignForm para usar el servicio

jsx
// src/components/campaigns/CampaignForm.js
// ... importaciones anteriores
import { createCampaign } from '../../services/campaignService';

const CampaignForm = () => {
  // ... código anterior

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Llamamos al servicio para crear la campaña
      await createCampaign(formData);
      alert('¡Campaña creada exitosamente!');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error al crear la campaña:', error);
      setErrors({ form: 'Error al crear la campaña. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... resto del código
};


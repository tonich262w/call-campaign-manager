// services/voximplantService.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.VOXIMPLANT_API_KEY;
const ACCOUNT_ID = process.env.VOXIMPLANT_ACCOUNT_ID;
const RULE_ID = process.env.VOXIMPLANT_RULE_ID;
const BASE_URL = 'https://api.voximplant.com/platform_api';

class VoximplantService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      params: {
        account_id: ACCOUNT_ID,
        api_key: API_KEY
      }
    });
  }

  // Autenticación con la API de Voximplant
  async authenticate() {
    try {
      const response = await this.axiosInstance.get('/GetAccountInfo');
      return response.data;
    } catch (error) {
      console.error('Error al autenticar con Voximplant:', error);
      throw new Error('Error al conectar con el proveedor de llamadas');
    }
  }

  // Crear una campaña en Voximplant
  async createCampaign(campaignData) {
    try {
      // Adaptamos nuestros datos al formato esperado por Voximplant
      const voximplantPayload = {
        campaign_name: campaignData.name,
        rule_id: RULE_ID,
        description: campaignData.description || '',
        max_attempts: campaignData.maxAttempts || 3,
        start_date: new Date(campaignData.startDate).toISOString(),
        end_date: new Date(campaignData.endDate).toISOString()
        // Otros parámetros específicos de Voximplant
      };

      const response = await this.axiosInstance.post('/CreateCampaign', voximplantPayload);
      
      // Devolvemos el ID de la campaña en Voximplant pero no exponemos otros detalles
      return {
        externalId: response.data.campaign_id,
        status: 'created'
      };
    } catch (error) {
      console.error('Error al crear campaña en Voximplant:', error);
      throw new Error('Error al crear la campaña en el sistema de llamadas');
    }
  }

  // Pausar una campaña
  async pauseCampaign(campaignExternalId) {
    try {
      const response = await this.axiosInstance.post('/StopCampaign', {
        campaign_id: campaignExternalId
      });
      
      return {
        status: 'paused',
        message: response.data.result || 'Campaña pausada exitosamente'
      };
    } catch (error) {
      console.error('Error al pausar campaña en Voximplant:', error);
      throw new Error('Error al pausar la campaña');
    }
  }

  // Reanudar una campaña
  async resumeCampaign(campaignExternalId) {
    try {
      const response = await this.axiosInstance.post('/StartCampaign', {
        campaign_id: campaignExternalId
      });
      
      return {
        status: 'active',
        message: response.data.result || 'Campaña reanudada exitosamente'
      };
    } catch (error) {
      console.error('Error al reanudar campaña en Voximplant:', error);
      throw new Error('Error al reanudar la campaña');
    }
  }

  // Eliminar una campaña
  async deleteCampaign(campaignExternalId) {
    try {
      const response = await this.axiosInstance.post('/DeleteCampaign', {
        campaign_id: campaignExternalId
      });
      
      return {
        status: 'deleted',
        message: response.data.result || 'Campaña eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar campaña en Voximplant:', error);
      throw new Error('Error al eliminar la campaña');
    }
  }

  // Añadir leads a una campaña
  async addLeadsToCampaign(campaignExternalId, leads) {
    try {
      // Transformar los leads al formato esperado por Voximplant
      const formattedLeads = leads.map(lead => ({
        phone: lead.phone,
        name: lead.name,
        custom_data: JSON.stringify({
          email: lead.email,
          company: lead.company,
          // Otros datos personalizados
        })
      }));

      const response = await this.axiosInstance.post('/AddLeadsToCampaign', {
        campaign_id: campaignExternalId,
        leads: formattedLeads
      });

      return {
        status: 'success',
        imported: response.data.result_count || formattedLeads.length,
        message: 'Leads importados exitosamente'
      };
    } catch (error) {
      console.error('Error al añadir leads en Voximplant:', error);
      throw new Error('Error al importar los contactos');
    }
  }

  // Obtener estadísticas de una campaña
  async getCampaignStats(campaignExternalId) {
    try {
      const response = await this.axiosInstance.get('/GetCampaignInfo', {
        params: {
          campaign_id: campaignExternalId
        }
      });
      
      // Transformamos y ocultamos los datos de Voximplant
      // Solo devolvemos lo que necesitamos mostrar al cliente
      return {
        totalCalls: response.data.total_calls || 0,
        completedCalls: response.data.completed_calls || 0,
        successfulCalls: response.data.successful_calls || 0,
        callMinutes: response.data.call_minutes || 0,
        // Otros datos relevantes para el cliente
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de Voximplant:', error);
      throw new Error('Error al obtener las estadísticas de la campaña');
    }
  }

  // Calcular el costo real de las llamadas (para el sistema interno)
  async calculateRealCost(campaignExternalId) {
    try {
      const stats = await this.getCampaignStats(campaignExternalId);
      
      // Costo real por llamada desde Voximplant (se mantiene oculto del cliente)
      const realCostPerCall = 0.05; // Este es el costo real que te cobra Voximplant
      const realCostPerMinute = 0.01; // Costo real por minuto adicional
      
      const callCost = stats.completedCalls * realCostPerCall;
      const minuteCost = stats.callMinutes * realCostPerMinute;
      
      return {
        callCost,
        minuteCost,
        totalRealCost: callCost + minuteCost
      };
    } catch (error) {
      console.error('Error al calcular costo real:', error);
      throw new Error('Error al calcular el costo de la campaña');
    }
  }
}

module.exports = new VoximplantService();
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
      // En una implementación completa, aquí se haría una llamada real a la API de Voximplant
      // Pero por ahora, devolvemos datos basados en las campañas reales proporcionadas por el usuario
      
      // Mapeo de IDs a estadísticas reales
      const campaignStats = {
        'PRINT009PART1': {
          totalCalls: 997,
          completedCalls: 489,  // Éxitos + Fallos
          successfulCalls: 7,
          callMinutes: 1200,
          spent: 6.48
        },
        'PBTOTALPARTS': {
          totalCalls: 998,
          completedCalls: 382,  // Éxitos + Fallos
          successfulCalls: 5,
          callMinutes: 800,
          spent: 2.49
        },
        '1KLEADSP1': {
          totalCalls: 984,
          completedCalls: 460,  // Éxitos + Fallos
          successfulCalls: 6,
          callMinutes: 900,
          spent: 2.57
        }
      };
      
      // Si tenemos estadísticas para esta campaña, las devolvemos
      if (campaignStats[campaignExternalId]) {
        return campaignStats[campaignExternalId];
      }
      
      // Si no tenemos estadísticas para esta campaña, devolvemos valores por defecto
      return {
        totalCalls: 0,
        completedCalls: 0,
        successfulCalls: 0,
        callMinutes: 0,
        spent: 0
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
  
  // Obtener el saldo actual de la cuenta de Voximplant
  async getAccountBalance() {
    try {
      // En una implementación completa, aquí se haría una llamada real a la API de Voximplant
      // Pero por ahora, devolvemos el saldo real proporcionado por el usuario
      
      // NOTA: Este es el saldo real de la cuenta de Voximplant
      // En producción, este valor vendría de una llamada a la API
      return {
        balance: 0.86,  // Saldo real proporcionado por el usuario
        currency: 'USD',
        active: true
      };
    } catch (error) {
      console.error('Error al obtener saldo de Voximplant:', error);
      throw new Error('Error al conectar con el proveedor de llamadas');
    }
  }
  
  // Obtener todas las campañas de Voximplant
  async getAllCampaigns() {
    try {
      // En una implementación completa, aquí se haría una llamada real a la API de Voximplant
      // Pero por ahora, devolvemos las campañas reales proporcionadas por el usuario
      
      // Estas son las campañas reales del usuario
      return [
        {
          id: 'PRINT009PART1',
          name: 'PRINT009PART1',
          description: 'Scenario Luis',
          status: 'paused',
          totalLeads: 997,
          completedCalls: 489,  // Éxitos + Fallos
          successfulCalls: 7,
          failedCalls: 482,
          pendingCalls: 508,
          spent: 6.48
        },
        {
          id: 'PBTOTALPARTS',
          name: 'PBTOTALPARTS',
          description: 'Scenario Luis',
          status: 'paused',
          totalLeads: 998,
          completedCalls: 382,  // Éxitos + Fallos
          successfulCalls: 5,
          failedCalls: 377,
          pendingCalls: 616,
          spent: 2.49
        },
        {
          id: '1KLEADSP1',
          name: '1KLEADSP1',
          description: 'Scenario Luis',
          status: 'paused',
          totalLeads: 984,
          completedCalls: 460,  // Éxitos + Fallos
          successfulCalls: 6,
          failedCalls: 454,
          pendingCalls: 524,
          spent: 2.57
        }
      ];
    } catch (error) {
      console.error('Error al obtener campañas de Voximplant:', error);
      throw new Error('Error al obtener las campañas del proveedor de llamadas');
    }
  }

  // Obtener detalles de la lista de llamadas de una campaña desde Voximplant
  async getCampaignCallListDetails(campaignExternalId) {
    // NOTA: campaignExternalId no se usa directamente en GetCallHistory
    // Filtraremos por RULE_ID, asumiendo que es relevante para la campaña.
    // Para una implementación más robusta, se podría necesitar filtrar por fechas
    // o encontrar una forma de asociar llamadas directamente a la campaña_id si la API lo permite.
    console.log(`Fetching call history for RULE_ID: ${RULE_ID}`); // Log para depuración

    try {
      const response = await this.axiosInstance.get('/GetCallHistory', {
        params: {
          rule_id: RULE_ID, // Usar el Rule ID global
          count: 1000, // Obtener hasta 1000 registros (ajustar si es necesario)
          with_records: true, // Incluir detalles de costo y duración por llamada
          // Podríamos añadir from_date y to_date si tuviéramos las fechas de la campaña
        }
      });

      if (!response.data || !response.data.result || response.data.result.length === 0) {
        console.log('No call history found for this rule.');
        return [];
      }

      // Procesar el historial para agrupar por número de teléfono
      const callDetailsMap = new Map();

      for (const session of response.data.result) {
        // Asumimos que la primera 'other_party' es el destino de la llamada saliente
        if (session.other_parties && session.other_parties.length > 0) {
          const destinationNumber = session.other_parties[0].destination_number;
          const startTime = new Date(session.start_time);
          let duration = 0;
          let cost = 0;

          // Sumar duración y costo de todos los registros de la sesión
          if (session.records && session.records.length > 0) {
            session.records.forEach(record => {
              duration += record.duration || 0;
              cost += record.cost || 0;
            });
          }

          if (callDetailsMap.has(destinationNumber)) {
            // Actualizar existente
            const existing = callDetailsMap.get(destinationNumber);
            existing.attempts += 1;
            existing.total_duration_seconds += duration;
            existing.total_cost += cost;
            if (startTime > existing.last_attempt_time) {
              existing.last_attempt_time = startTime;
              // Podríamos intentar inferir el estado basado en la última llamada,
              // pero es complejo. Dejamos un estado placeholder por ahora.
              existing.last_call_status = duration > 0 ? 'Connected' : 'Failed';
            }
          } else {
            // Crear nuevo registro
            callDetailsMap.set(destinationNumber, {
              phone_number: destinationNumber,
              attempts: 1,
              last_attempt_time: startTime,
              total_duration_seconds: duration,
              total_cost: cost,
              // Estado inicial basado en la primera llamada encontrada
              last_call_status: duration > 0 ? 'Connected' : 'Failed',
            });
          }
        }
      }
      // Convertir el mapa a un array
      const callListDetails = Array.from(callDetailsMap.values());
      console.log(`Processed ${callListDetails.length} unique numbers from call history.`);
      return callListDetails;

    } catch (error) {
      // Manejo específico de errores de Axios
      if (error.response) {
        console.error('Error response from Voximplant API (GetCallHistory):', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        console.error('Error making request to Voximplant API (GetCallHistory):', error.request);
      } else {
        console.error('Error processing call history:', error.message);
      }
      throw new Error('Error al obtener el historial de llamadas de Voximplant');
    }
  }
}

module.exports = new VoximplantService();
const axios = require('axios');
const crypto = require('crypto');

class VoximplantService {
  constructor() {
    this.apiKey = process.env.VOXIMPLANT_API_KEY;
    this.accountId = process.env.VOXIMPLANT_ACCOUNT_ID;
    this.apiUrl = 'https://api.voximplant.com/platform_api';
    this.token = null;
    this.tokenExpire = null;
  }

  // Generar token de autenticación
  async getToken() {
    // Si ya tenemos un token válido, lo devolvemos
    if (this.token && this.tokenExpire && this.tokenExpire > Date.now()) {
      return this.token;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = crypto
        .createHash('md5')
        .update(this.accountId + timestamp + this.apiKey)
        .digest('hex');

      const response = await axios.get(${this.apiUrl}/GetAccountInfo, {
        params: {
          account_id: this.accountId,
          api_key: this.apiKey,
          timestamp,
          hash,
        },
      });

      if (response.data.error) {
        throw new Error(Error de Voximplant: ${response.data.error.msg});
      }

      this.token = response.data.token;
      this.tokenExpire = Date.now() + 3600000; // 1 hora

      return this.token;
    } catch (error) {
      console.error('Error al obtener token de Voximplant:', error);
      throw new Error('No se pudo autenticar con el servicio de telefonía');
    }
  }

  // Crear una campaña
  async createCampaign(campaignData) {
    try {
      const token = await this.getToken();

      // Transformar datos al formato requerido por Voximplant
      const transformedData = {
        campaign_name: campaignData.name,
        rule_id: process.env.VOXIMPLANT_RULE_ID, // Debe estar configurado en .env
        start_date: campaignData.schedule.startDate,
        finish_date: campaignData.schedule.endDate || null,
        from_time: campaignData.schedule.workingHours.start,
        till_time: campaignData.schedule.workingHours.end,
        max_attempts: campaignData.settings.maxAttempts,
        retry_interval: campaignData.settings.retryInterval,
        working_days: campaignData.schedule.workingDays.join(','),
      };

      const response = await axios.get(${this.apiUrl}/AddCampaign, {
        params: {
          account_id: this.accountId,
          api_key: this.apiKey,
          campaign_name: transformedData.campaign_name,
          rule_id: transformedData.rule_id,
          start_date: transformedData.start_date,
          finish_date: transformedData.finish_date,
          from_time: transformedData.from_time,
          till_time: transformedData.till_time,
          max_attempts: transformedData.max_attempts,
          retry_interval: transformedData.retry_interval,
          working_days: transformedData.working_days,
          token,
        },
      });

      if (response.data.error) {
        throw new Error(Error de Voximplant: ${response.data.error.msg});
      }

      return {
        success: true,
        externalId: response.data.campaign_id.toString(),
        campaignName: response.data.campaign_name,
      };
    } catch (error) {
      console.error('Error al crear campaña en Voximplant:', error);
      throw new Error('No se pudo crear la campaña en el servicio de telefonía');
    }
  }

  // Pausar una campaña
  async pauseCampaign(externalId) {
    try {
      const token = await this.getToken();

      const response = await axios.get(${this.apiUrl}/PauseCampaign, {
        params: {
          account_id: this.accountId,
          api_key: this.apiKey,
          campaign_id: externalId,
          token,
        },
      });

      if (response.data.error) {
        throw new Error(Error de Voximplant: ${response.data.error.msg});
      }

      return {
        success: true,
        message: 'Campaña pausada exitosamente',
      };
    } catch (error) {
      console.error('Error al pausar campaña en Voximplant:', error);
      throw new Error('No se pudo pausar la campaña');
    }
  }

  // Obtener costo de una llamada
  async getCallCost(duration, destination) {
    // Este es un ejemplo simple. En la realidad, necesitarías consultar 
    // las tarifas reales de Voximplant para el destino específico.
    try {
      // Suponemos una tarifa base de $0.01 por minuto para simplificar
      const baseCost = 0.01;
      
      // Convertir duración de segundos a minutos
      const durationInMinutes = duration / 60;
      
      // Calcular el costo real
      const cost = baseCost * durationInMinutes;
      
      return cost;
    } catch (error) {
      console.error('Error al calcular costo de llamada:', error);
      return 0.01; // Costo mínimo por defecto
    }
  }

  // Añade aquí más métodos según sea necesario...
}

module.exports = new VoximplantService();
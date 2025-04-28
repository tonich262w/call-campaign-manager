// controllers/campaignController.js
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const { Balance } = require('../models/balanceModel');
const voximplantService = require('../services/voximplantService');
const balanceController = require('./balanceController');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv'); // Importar json2csv

// Configuración para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Sólo se permiten archivos CSV'));
    }
  }
}).single('file');

// Obtener todas las campañas del usuario
const getCampaigns = async (req, res) => {
  try {
    // Intentar obtener campañas reales de Voximplant
    try {
      // Obtener campañas reales de Voximplant
      const voximplantCampaigns = await voximplantService.getAllCampaigns();
      
      if (voximplantCampaigns && voximplantCampaigns.length > 0) {
        // Actualizar o crear campañas en nuestra base de datos
        for (const voxCampaign of voximplantCampaigns) {
          // Verificar si ya existe la campaña en nuestra base de datos
          let campaign = await Campaign.findOne({ 
            externalId: voxCampaign.id,
            userId: req.user._id 
          });
          
          if (campaign) {
            // Actualizar la campaña existente
            campaign.name = voxCampaign.name;
            campaign.description = voxCampaign.description;
            campaign.status = voxCampaign.status;
            campaign.totalLeads = voxCampaign.totalLeads;
            campaign.completedCalls = voxCampaign.completedCalls;
            campaign.successfulCalls = voxCampaign.successfulCalls;
            await campaign.save();
          } else {
            // Crear una nueva campaña
            await Campaign.create({
              externalId: voxCampaign.id,
              name: voxCampaign.name,
              description: voxCampaign.description,
              startDate: new Date(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              status: voxCampaign.status,
              totalLeads: voxCampaign.totalLeads,
              completedCalls: voxCampaign.completedCalls,
              successfulCalls: voxCampaign.successfulCalls,
              userId: req.user._id
            });
          }
        }
        
        // Obtener las campañas actualizadas de la base de datos
        const campaigns = await Campaign.find({ userId: req.user._id })
          .select('-externalId'); // No exponemos el ID en Voximplant
        
        return res.status(200).json(campaigns);
      }
    } catch (voxError) {
      console.error('Error al obtener campañas de Voximplant:', voxError);
      // Si hay error, continuamos con las campañas de la base de datos
    }
    
    // Si no pudimos obtener campañas de Voximplant, usamos las de la base de datos
    const campaigns = await Campaign.find({ userId: req.user._id })
      .select('-externalId');
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    res.status(500).json({ message: 'Error al obtener campañas' });
  }
};

// Obtener una campaña específica
const getCampaignById = async (req, res) => {
  try {
    console.log('ID recibido en getCampaignById:', req.params.id);
    
    // Validar formato de ID
    let campaignId;
    try {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        campaignId = req.params.id; // Mantener el ID como string, MongoDB lo convertirá automáticamente
      } else {
        return res.status(400).json({ message: 'ID de campaña inválido' });
      }
    } catch (idError) {
      console.error('Error al validar ID:', idError);
      return res.status(400).json({ message: 'Formato de ID inválido' });
    }
    
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    }).select('-externalId');
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Obtenemos estadísticas actualizadas (sin exponer datos de Voximplant)
    // Solo si la campaña está activa y tiene un ID externo
    if (campaign.status === 'active' && campaign.externalId) {
      try {
        const stats = await voximplantService.getCampaignStats(campaign.externalId);
        
        // Actualizamos la información en nuestra base de datos
        campaign.totalLeads = stats.totalCalls || campaign.totalLeads;
        campaign.completedCalls = stats.completedCalls || campaign.completedCalls;
        campaign.successfulCalls = stats.successfulCalls || campaign.successfulCalls;
        
        await campaign.save();
      } catch (error) {
        console.error('Error al obtener estadísticas externas:', error);
        // Continuamos con los datos existentes si hay error
      }
    }
    
    // Obtener leads de esta campaña
    const leads = await Lead.find({ campaignId: campaignId })
      .limit(100); // Limitamos para no sobrecargar
    
    res.status(200).json({
      campaign,
      leads
    });
  } catch (error) {
    console.error('Error al obtener detalles de campaña:', error);
    res.status(500).json({ message: 'Error al obtener detalles de la campaña' });
  }
};

// Crear una nueva campaña
const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      timezone,
      callHoursStart,
      callHoursEnd,
      callDays,
      maxAttempts,
      callScript,
      targetAudience
    } = req.body;
    
    // Creamos primero en nuestra base de datos
    const campaign = await Campaign.create({
      userId: req.user._id,
      name,
      description,
      startDate,
      endDate,
      timezone,
      callHoursStart,
      callHoursEnd,
      callDays,
      maxAttempts,
      callScript,
      targetAudience,
      status: 'inactive', // Inicialmente inactiva hasta que se añadan leads
      totalLeads: 0,
      completedCalls: 0,
      successfulCalls: 0
    });
    
    // Ahora la registramos en Voximplant, pero ocultamos esa interacción del cliente
    try {
      const externalCampaign = await voximplantService.createCampaign({
        name,
        description,
        startDate,
        endDate,
        maxAttempts: maxAttempts || 3
        // Otros campos necesarios
      });
      
      // Guardamos el ID externo pero no lo exponemos al cliente
      await Campaign.findByIdAndUpdate(campaign._id, {
        externalId: externalCampaign.externalId
      });
    } catch (error) {
      console.error('Error al crear campaña externa:', error);
      // Eliminar campaña de nuestra base si falla la creación externa
      await Campaign.findByIdAndDelete(campaign._id);
      return res.status(500).json({ message: 'Error al crear la campaña en el sistema de llamadas' });
    }
    
    res.status(201).json({
      message: 'Campaña creada exitosamente',
      campaignId: campaign._id
    });
  } catch (error) {
    console.error('Error al crear campaña:', error);
    res.status(500).json({ message: 'Error al crear la campaña' });
  }
};

// Pausar una campaña
const pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({ message: 'La campaña no está activa' });
    }
    
    // Pausar en el sistema externo
    try {
      await voximplantService.pauseCampaign(campaign.externalId);
    } catch (error) {
      console.error('Error al pausar campaña externa:', error);
      return res.status(500).json({ message: 'Error al pausar la campaña' });
    }
    
    // Actualizar en nuestra base
    campaign.status = 'paused';
    await campaign.save();
    
    res.status(200).json({
      message: 'Campaña pausada exitosamente',
      status: 'paused'
    });
  } catch (error) {
    console.error('Error al pausar campaña:', error);
    res.status(500).json({ message: 'Error al pausar la campaña' });
  }
};

// Reanudar una campaña
const resumeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    if (campaign.status !== 'paused') {
      return res.status(400).json({ message: 'La campaña no está pausada' });
    }
    
    // Verificar si hay saldo suficiente
    const balance = await Balance.findOne({ userId: req.user._id });
    if (!balance || balance.currentBalance <= 0) {
      return res.status(400).json({ 
        message: 'Saldo insuficiente para reanudar la campaña' 
      });
    }
    
    // Reanudar en el sistema externo
    try {
      await voximplantService.resumeCampaign(campaign.externalId);
    } catch (error) {
      console.error('Error al reanudar campaña externa:', error);
      return res.status(500).json({ message: 'Error al reanudar la campaña' });
    }
    
    // Actualizar en nuestra base
    campaign.status = 'active';
    await campaign.save();
    
    res.status(200).json({
      message: 'Campaña reanudada exitosamente',
      status: 'active'
    });
  } catch (error) {
    console.error('Error al reanudar campaña:', error);
    res.status(500).json({ message: 'Error al reanudar la campaña' });
  }
};

// Actualizar una campaña
const updateCampaign = async (req, res) => {
  try {
    console.log('ID recibido en updateCampaign:', req.params.id);
    console.log('Datos recibidos:', req.body);
    
    // Validar formato de ID
    let campaignId;
    try {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        campaignId = req.params.id;
      } else {
        return res.status(400).json({ message: 'ID de campaña inválido' });
      }
    } catch (idError) {
      console.error('Error al validar ID:', idError);
      return res.status(400).json({ message: 'Formato de ID inválido' });
    }
    
    // Buscar la campaña
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Actualizar los campos permitidos
    const allowedFields = [
      'name', 'description', 'startDate', 'endDate', 'timezone',
      'callHoursStart', 'callHoursEnd', 'callDays', 'script', 'status'
    ];
    
    // Solo actualizamos los campos permitidos que se proporcionan
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });
    
    // Si la campaña está registrada en Voximplant y hay cambios en horarios o script
    // Podríamos actualizar en Voximplant, pero por ahora solo lo guardamos localmente
    
    await campaign.save();
    
    res.status(200).json({
      message: 'Campaña actualizada exitosamente',
      campaign
    });
  } catch (error) {
    console.error('Error al actualizar campaña:', error);
    res.status(500).json({ message: 'Error al actualizar la campaña' });
  }
};

// Eliminar una campaña
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Si tiene un ID externo, eliminar en el sistema externo
    if (campaign.externalId) {
      try {
        await voximplantService.deleteCampaign(campaign.externalId);
      } catch (error) {
        console.error('Error al eliminar campaña externa:', error);
        // Continuamos con la eliminación en nuestra base incluso si falla externa
      }
    }
    
    // Eliminar leads asociados
    await Lead.deleteMany({ campaignId: req.params.id });
    
    // Eliminar la campaña
    await Campaign.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Campaña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    res.status(500).json({ message: 'Error al eliminar la campaña' });
  }
};

// Importar leads a una campaña
const importLeads = async (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    try {
      const campaignId = req.params.id;
      
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: req.user._id
      });
      
      if (!campaign) {
        // Eliminar archivo
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Campaña no encontrada' });
      }
      
      // Leer y procesar el CSV
      const leads = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          // Validación básica
          if (data.phone) {
            leads.push({
              campaignId,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone,
              company: data.company || '',
              status: 'new'
            });
          }
        })
        .on('end', async () => {
          // Eliminar archivo temporal
          fs.unlinkSync(req.file.path);
          
          if (leads.length === 0) {
            return res.status(400).json({ 
              message: 'No se encontraron leads válidos en el archivo' 
            });
          }
          
          // Verificar saldo suficiente
          const balance = await Balance.findOne({ userId: req.user._id });
          if (!balance) {
            return res.status(400).json({ message: 'No tiene saldo disponible' });
          }
          
          // Obtener tarifa actual
          const pricing = await require('../models/balanceModel').Pricing.findOne({ active: true });
          if (!pricing) {
            return res.status(500).json({ message: 'Error en configuración de tarifas' });
          }
          
          const estimatedCost = leads.length * pricing.callRate;
          
          if (balance.currentBalance < estimatedCost) {
            return res.status(400).json({
              message: 'Saldo insuficiente para importar todos los leads',
              requiredBalance: estimatedCost,
              currentBalance: balance.currentBalance
            });
          }
          
          // Guardar leads en nuestra base
          const savedLeads = await Lead.insertMany(leads);
          
          // Actualizar total de leads en la campaña
          campaign.totalLeads += savedLeads.length;
          
          // Si la campaña está inactiva, activarla
          if (campaign.status === 'inactive') {
            campaign.status = 'active';
          }
          
          await campaign.save();
          
          // Añadir leads al sistema externo
          try {
            await voximplantService.addLeadsToCampaign(
              campaign.externalId,
              savedLeads
            );
          } catch (error) {
            console.error('Error al añadir leads externos:', error);
            return res.status(500).json({ 
              message: 'Error al importar contactos al sistema de llamadas',
              leadsImported: savedLeads.length
            });
          }
          
          res.status(200).json({
            message: 'Leads importados exitosamente',
            count: savedLeads.length
          });
        });
    } catch (error) {
      console.error('Error al importar leads:', error);
      // Si hay archivo, eliminarlo en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Error al procesar la importación de leads' });
    }
  });
};

// Actualizar estado de un lead
const updateLeadStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    const lead = await Lead.findOne({
      _id: leadId,
      userId: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }
    
    lead.status = status;
    await lead.save();
    
    res.status(200).json({
      message: 'Estado de lead actualizado',
      lead
    });
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    res.status(500).json({ message: 'Error al actualizar estado del lead' });
  }
};

// Webhook para recibir actualizaciones de Voximplant (oculto para el cliente)
const voximplantWebhook = async (req, res) => {
  try {
    const { campaign_id, call_session_id, status, call_duration, result } = req.body;
    
    // Verificar la autenticidad del webhook con firma o secreto
    // ...validación aquí...
    
    // Buscar campaña por ID externo
    const campaign = await Campaign.findOne({ externalId: campaign_id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Actualizar estadísticas de la campaña
    if (status === 'completed') {
      campaign.completedCalls += 1;
      
      // Si el resultado fue exitoso
      if (result === 'success' || result === 'converted') {
        campaign.successfulCalls += 1;
      }
      
      await campaign.save();
      
      // Descontar saldo (1 llamada y los minutos de duración)
      try {
        await balanceController.deductBalance(
          campaign.userId,
          campaign._id,
          1, // Una llamada
          Math.ceil(call_duration / 60) // Duración en minutos redondeada hacia arriba
        );
      } catch (error) {
        console.error('Error al descontar saldo por llamada:', error);
        // Continuamos aunque falle el descuento para no interrumpir el webhook
      }
    }
    
    res.status(200).json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    console.error('Error en webhook de Voximplant:', error);
    res.status(500).json({ message: 'Error al procesar webhook' });
  }
};

// Exportar progreso de la campaña en CSV
const exportCampaignProgress = async (req, res) => {
  try {
    const campaignId = req.params.id;

    // 1. Buscar la campaña en nuestra base de datos para obtener el ID externo
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || !campaign.externalId) {
      return res.status(404).json({ message: 'Campaña no encontrada o sin ID externo' });
    }

    // 2. Obtener detalles de la lista de llamadas de Voximplant
    let callListDetails;
    try {
      // Necesitaremos implementar esta función en voximplantService
      callListDetails = await voximplantService.getCampaignCallListDetails(campaign.externalId);
      if (!callListDetails || callListDetails.length === 0) {
        return res.status(404).json({ message: 'No se encontraron detalles de llamadas para esta campaña en Voximplant.' });
      }
    } catch (voxError) {
      console.error('Error al obtener detalles de llamadas de Voximplant:', voxError);
      return res.status(500).json({ message: 'Error al contactar con Voximplant para obtener los detalles.' });
    }

    // 3. Definir los campos para el CSV (ajustar según los datos reales de Voximplant)
    const fields = [
      { label: 'Número de Teléfono', value: 'phone_number' }, // Ajustar nombres de campo
      { label: 'Estado Última Llamada', value: 'last_call_status' },
      { label: 'Intentos', value: 'attempts' },
      { label: 'Último Intento', value: 'last_attempt_time' },
      { label: 'Duración Total (seg)', value: 'total_duration_seconds' },
      { label: 'Costo Total', value: 'total_cost' },
      // Añadir más campos si es necesario
    ];

    // 4. Crear el parser CSV
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(callListDetails);

    // 5. Configurar la respuesta para descargar el archivo
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campaign_${campaign.name}_progress_${Date.now()}.csv`);

    // 6. Enviar el CSV
    res.status(200).send(csvData);

  } catch (error) {
    console.error('Error al exportar progreso de la campaña:', error);
    res.status(500).json({ message: 'Error interno al generar el archivo de progreso.' });
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  importLeads,
  updateLeadStatus,
  voximplantWebhook,
  exportCampaignProgress
};

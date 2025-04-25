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
    const campaigns = await Campaign.find({ userId: req.user._id })
      .select('-externalId'); // No exponemos el ID en Voximplant
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    res.status(500).json({ message: 'Error al obtener campañas' });
  }
};

// Obtener una campaña específica
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
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
    const leads = await Lead.find({ campaignId: req.params.id })
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

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  importLeads,
  updateLeadStatus,
  voximplantWebhook
};

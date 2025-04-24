const asyncHandler = require('express-async-handler');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const voximplantService = require('../services/voximplantService');

// @desc    Crear una nueva campaña
// @route   POST /api/campaigns
// @access  Private
const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    schedule,
    settings,
  } = req.body;

  // Validar datos mínimos
  if (!name) {
    res.status(400);
    throw new Error('El nombre de la campaña es obligatorio');
  }

  try {
    // Crear campaña en Voximplant (primero en el servicio externo)
    const voximplantResponse = await voximplantService.createCampaign({
      name,
      schedule: schedule || {
        startDate: new Date(),
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: [1, 2, 3, 4, 5],
      },
      settings: settings || {
        maxAttempts: 3,
        retryInterval: 60,
      },
    });

    // Si se creó correctamente en Voximplant, crear en nuestra BD
    const campaign = new Campaign({
      name,
      description: description || '',
      user: req.user._id,
      schedule: schedule || {
        startDate: new Date(),
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: [1, 2, 3, 4, 5],
      },
      settings: settings || {
        maxAttempts: 3,
        retryInterval: 60,
      },
      externalId: voximplantResponse.externalId,
    });

    await campaign.save();

    res.status(201).json(campaign);
  } catch (error) {
    res.status(400);
    throw new Error(Error al crear campaña: ${error.message});
  }
});

// @desc    Obtener todas las campañas del usuario
// @route   GET /api/campaigns
// @access  Private
const getCampaigns = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const campaigns = await Campaign.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Campaign.countDocuments({ user: req.user._id });

  res.json({
    campaigns,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  });
});

// @desc    Obtener una campaña por ID
// @route   GET /api/campaigns/:id
// @access  Private
const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (campaign) {
    res.json(campaign);
  } else {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }
});

// @desc    Actualizar una campaña
// @route   PUT /api/campaigns/:id
// @access  Private
const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  // Actualizar solo campos permitidos
  const { name, description, schedule, settings } = req.body;

  campaign.name = name || campaign.name;
  campaign.description = description || campaign.description;
  
  if (schedule) {
    campaign.schedule = {
      ...campaign.schedule,
      ...schedule,
    };
  }
  
  if (settings) {
    campaign.settings = {
      ...campaign.settings,
      ...settings,
    };
  }

  const updatedCampaign = await campaign.save();
  res.json(updatedCampaign);
});

// @desc    Pausar una campaña
// @route   POST /api/campaigns/:id/pause
// @access  Private
const pauseCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  if (campaign.status === 'paused') {
    res.status(400);
    throw new Error('La campaña ya está pausada');
  }

  try {
    // Pausar en Voximplant
    await voximplantService.pauseCampaign(campaign.externalId);
    
    // Actualizar estado en nuestra BD
    campaign.status = 'paused';
    await campaign.save();
    
    res.json({
      success: true,
      message: 'Campaña pausada exitosamente',
      campaign,
    });
  } catch (error) {
    res.status(400);
    throw new Error(Error al pausar campaña: ${error.message});
  }
});

// @desc    Reanudar una campaña
// @route   POST /api/campaigns/:id/resume
// @access  Private
const resumeCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  if (campaign.status !== 'paused') {
    res.status(400);
    throw new Error('La campaña no está pausada');
  }

  try {
    // Reanudar en Voximplant
    await voximplantService.resumeCampaign(campaign.externalId);
    
    // Actualizar estado en nuestra BD
    campaign.status = 'active';
    await campaign.save();
    
    res.json({
      success: true,
      message: 'Campaña reanudada exitosamente',
      campaign,
    });
  } catch (error) {
    res.status(400);
    throw new Error(Error al reanudar campaña: ${error.message});
  }
});

// @desc    Eliminar una campaña
// @route   DELETE /api/campaigns/:id
// @access  Private
const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  try {
    // Eliminar en Voximplant
    await voximplantService.deleteCampaign(campaign.externalId);
    
    // Actualizar estado en nuestra BD
    campaign.status = 'deleted';
    await campaign.save();
    
    res.json({
      success: true,
      message: 'Campaña eliminada exitosamente',
    });
  } catch (error) {
    res.status(400);
    throw new Error(Error al eliminar campaña: ${error.message});
  }
});

// @desc    Obtener estadísticas de una campaña
// @route   GET /api/campaigns/:id/stats
// @access  Private
const getCampaignStats = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  try {
    // Obtener estadísticas de Voximplant
    const externalStats = await voximplantService.getCampaignStats(campaign.externalId);
    
    // Obtener estadísticas de nuestra BD
    const totalLeads = await Lead.countDocuments({ campaign: campaign._id });
    const processedLeads = await Lead.countDocuments({ 
      campaign: campaign._id,
      status: { $ne: 'pending' }
    });
    
    // Combinar estadísticas
    const stats = {
      campaignId: campaign._id,
      name: campaign.name,
      status: campaign.status,
      totalLeads,
      processedLeads,
      progression: totalLeads > 0 ? (processedLeads / totalLeads) * 100 : 0,
      externalStats: {
        totalCalls: externalStats.totalCalls,
        answeredCalls: externalStats.answeredCalls,
        averageDuration: externalStats.averageDuration,
        completionPercentage: externalStats.completionPercentage,
      },
      updatedAt: new Date(),
    };
    
    res.json(stats);
  } catch (error) {
    res.status(400);
    throw new Error(Error al obtener estadísticas: ${error.message});
  }
});

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  getCampaignStats,
};
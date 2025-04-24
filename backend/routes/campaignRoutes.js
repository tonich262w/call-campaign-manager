const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  getCampaignStats,
} = require('../controllers/campaignController');
const { protect } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .post(createCampaign)
  .get(getCampaigns);

router.route('/:id')
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);

router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);
router.get('/:id/stats', getCampaignStats);

module.exports = router;


## Paso 19: Crear controlador de leads

1. Navega a la carpeta `controllers`:
   
   cd ../controllers
   

2. Crea un archivo llamado `leadController.js`:

javascript
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const Lead = require('../models/leadModel');
const Campaign = require('../models/campaignModel');
const voximplantService = require('../services/voximplantService');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, ${Date.now()}-${file.originalname});
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    // Aceptar solo CSV o Excel
    const filetypes = /csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Solo archivos CSV o Excel son permitidos!');
    }
  },
}).single('file');

// @desc    Crear un nuevo lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler(async (req, res) => {
  const { name, phone, email, campaignId, customFields } = req.body;

  // Validaciones básicas
  if (!name || !phone || !campaignId) {
    res.status(400);
    throw new Error('Nombre, teléfono y campaña son requeridos');
  }

  // Verificar que la campaña existe y pertenece al usuario
  const campaign = await Campaign.findOne({
    _id: campaignId,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  // Crear lead en nuestra BD
  const lead = new Lead({
    name,
    phone,
    email: email || '',
    campaign: campaignId,
    user: req.user._id,
    customFields: customFields || {},
  });

  await lead.save();

  // Agregar lead a Voximplant
  try {
    await voximplantService.addLeadToCampaign(campaign.externalId, {
      name,
      phone,
      email,
      customFields,
    });

    // Actualizar contador de leads en la campaña
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 'stats.totalLeads': 1 },
    });

    res.status(201).json(lead);
  } catch (error) {
    // Si falla la adición a Voximplant, eliminar de nuestra BD
    await Lead.findByIdAndDelete(lead._id);
    res.status(400);
    throw new Error(Error al agregar lead a la campaña externa: ${error.message});
  }
});

// @desc    Importar leads desde archivo CSV
// @route   POST /api/leads/import/:campaignId
// @access  Private
const importLeads = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;

  // Verificar que la campaña existe y pertenece al usuario
  const campaign = await Campaign.findOne({
    _id: campaignId,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  // Middleware para subir archivo
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Por favor sube un archivo' });
    }

    const filePath = req.file.path;
    const leads = [];
    let validLeads = 0;
    let invalidLeads = 0;

    // Procesar archivo CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Validar datos mínimos
        if (row.name && row.phone) {
          leads.push({
            name: row.name,
            phone: row.phone,
            email: row.email || '',
            campaign: campaignId,
            user: req.user._id,
            customFields: Object.keys(row)
              .filter(key => !['name', 'phone', 'email'].includes(key))
              .reduce((obj, key) => {
                obj[key] = row[key];
                return obj;
              }, {}),
          });
          validLeads++;
        } else {
          invalidLeads++;
        }
      })
      .on('end', async () => {
        try {
          // Guardar leads en nuestra BD
          const savedLeads = await Lead.insertMany(leads);

          // Agregar leads a Voximplant
          const voximplantLeads = leads.map(lead => ({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            customFields: lead.customFields,
          }));

          await voximplantService.addLeadsToCampaign(campaign.externalId, voximplantLeads);

          // Actualizar contador de leads en la campaña
          await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { 'stats.totalLeads': validLeads },
          });

          // Eliminar archivo temporal
          fs.unlinkSync(filePath);

          res.status(201).json({
            success: true,
            validLeads,
            invalidLeads,
            message: Se importaron ${validLeads} leads correctamente. ${invalidLeads} leads fueron ignorados por datos incompletos.,
          });
        } catch (error) {
          console.error('Error al importar leads:', error);
          res.status(400);
          throw new Error(Error al importar leads: ${error.message});
        }
      });
  });
});

// @desc    Obtener leads de una campaña
// @route   GET /api/leads/campaign/:campaignId
// @access  Private
const getLeadsByCampaign = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Verificar que la campaña existe y pertenece al usuario
  const campaign = await Campaign.findOne({
    _id: campaignId,
    user: req.user._id,
  });

  if (!campaign) {
    res.status(404);
    throw new Error('Campaña no encontrada');
  }

  const leads = await Lead.find({ campaign: campaignId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Lead.countDocuments({ campaign: campaignId });

  res.json({
    leads,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  });
});

// @desc    Obtener un lead por ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('campaign', 'name');

  if (lead) {
    res.json(lead);
  } else {
    res.status(404);
    throw new Error('Lead no encontrado');
  }
});

// @desc    Actualizar un lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!lead) {
    res.status(404);
    throw new Error('Lead no encontrado');
  }

  const { name, phone, email, status, notes, customFields } = req.body;

  lead.name = name || lead.name;
  lead.phone = phone || lead.phone;
  lead.email = email || lead.email;
  lead.status = status || lead.status;
  lead.notes = notes || lead.notes;
  
  if (customFields) {
    lead.customFields = {
      ...lead.customFields,
      ...customFields,
    };
  }

  const updatedLead = await lead.save();
  res.json(updatedLead);
});

// @desc    Eliminar un lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!lead) {
    res.status(404);
    throw new Error('Lead no encontrado');
  }

  await Lead.deleteOne({ _id: req.params.id });

  // Actualizar contador de leads en la campaña
  await Campaign.findByIdAndUpdate(lead.campaign, {
    $inc: { 'stats.totalLeads': -1 },
  });

  res.json({ message: 'Lead eliminado exitosamente' });
});

module.exports = {
  createLead,
  importLeads,
  getLeadsByCampaign,
  getLeadById,
  updateLead,
  deleteLead,
};
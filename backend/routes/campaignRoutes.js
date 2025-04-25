// routes/campaignRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  importLeads,
  voximplantWebhook
} = require('../controllers/campaignController');

const router = express.Router();

// Rutas protegidas
router.get('/', protect, getCampaigns);
router.get('/:id', protect, getCampaignById);
router.post('/', protect, createCampaign);
router.put('/:id/pause', protect, pauseCampaign);
router.put('/:id/resume', protect, resumeCampaign);
router.delete('/:id', protect, deleteCampaign);
router.post('/:id/import-leads', protect, importLeads);

// Webhook de Voximplant (ruta no protegida pero con validación interna)
router.post('/webhook', voximplantWebhook);

module.exports = router;
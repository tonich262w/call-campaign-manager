// routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLead,
  importLeads,
  getLeadsByCampaign,
  getLeadById,
  updateLead,
  deleteLead,
  updateLeadStatus // Añadido para integración con Voximplant
} = require('../controllers/leadController');
const { protect } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/import/:campaignId', importLeads);
router.get('/campaign/:campaignId', getLeadsByCampaign);

// Nueva ruta para actualizar el estado de un lead (para integración con Voximplant)
router.put('/:leadId/status', updateLeadStatus);

module.exports = router;
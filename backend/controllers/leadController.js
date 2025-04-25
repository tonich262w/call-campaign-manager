// controllers/leadController.js
const Lead = require('../models/leadModel');
const Campaign = require('../models/campaignModel');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Crear un nuevo lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, campaignId, status } = req.body;
    
    // Verificar que la campaña existe y pertenece al usuario
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    const lead = await Lead.create({
      campaignId,
      userId: req.user._id,
      name,
      email,
      phone,
      company,
      status: status || 'new'
    });
    
    // Actualizar contador de leads en la campaña
    campaign.totalLeads += 1;
    await campaign.save();
    
    res.status(201).json({
      message: 'Lead creado exitosamente',
      lead
    });
  } catch (error) {
    console.error('Error al crear lead:', error);
    res.status(500).json({ message: 'Error al crear lead' });
  }
};

// Importar leads desde CSV
const importLeads = async (req, res) => {
  // Configuración de multer para subida de archivos
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
  
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    try {
      const { campaignId } = req.params;
      
      // Verificar que la campaña existe y pertenece al usuario
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
              userId: req.user._id,
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
          
          // Guardar leads en la base de datos
          const savedLeads = await Lead.insertMany(leads);
          
          // Actualizar total de leads en la campaña
          campaign.totalLeads += savedLeads.length;
          await campaign.save();
          
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

// Obtener leads por campaña
const getLeadsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Verificar que la campaña existe y pertenece al usuario
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    
    // Filtros
    const filter = { campaignId };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Lead.countDocuments(filter);
    
    res.status(200).json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener leads:', error);
    res.status(500).json({ message: 'Error al obtener leads' });
  }
};

// Obtener un lead por ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }
    
    res.status(200).json(lead);
  } catch (error) {
    console.error('Error al obtener lead:', error);
    res.status(500).json({ message: 'Error al obtener lead' });
  }
};

// Actualizar un lead
const updateLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;
    
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }
    
    // Actualizar campos
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (company) lead.company = company;
    if (status) lead.status = status;
    if (notes) lead.notes = notes;
    
    await lead.save();
    
    res.status(200).json({
      message: 'Lead actualizado exitosamente',
      lead
    });
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    res.status(500).json({ message: 'Error al actualizar lead' });
  }
};

// Eliminar un lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead no encontrado' });
    }
    
    await Lead.deleteOne({_id: lead._id});
    
    // Actualizar contador de leads en la campaña
    const campaign = await Campaign.findById(lead.campaignId);
    if (campaign) {
      campaign.totalLeads = Math.max(0, campaign.totalLeads - 1);
      await campaign.save();
    }
    
    res.status(200).json({
      message: 'Lead eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar lead:', error);
    res.status(500).json({ message: 'Error al eliminar lead' });
  }
};

// Actualizar estado de un lead (para integración con Voximplant)
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
    
    // Si el estado es 'contacted' o superior, registrar la llamada
    if (status !== 'new') {
      lead.lastCallDate = new Date();
      lead.callAttempts += 1;
    }
    
    await lead.save();
    
    // Si el estado es 'converted', actualizar estadísticas de la campaña
    if (status === 'converted') {
      const campaign = await Campaign.findById(lead.campaignId);
      if (campaign) {
        campaign.successfulCalls += 1;
        await campaign.save();
      }
    }
    
    res.status(200).json({
      message: 'Estado de lead actualizado exitosamente',
      lead
    });
  } catch (error) {
    console.error('Error al actualizar estado del lead:', error);
    res.status(500).json({ message: 'Error al actualizar estado del lead' });
  }
};

module.exports = {
  createLead,
  importLeads,
  getLeadsByCampaign,
  getLeadById,
  updateLead,
  deleteLead,
  updateLeadStatus
};
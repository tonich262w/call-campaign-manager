// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  company: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// models/campaignModel.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'GMT-5'
  },
  callHoursStart: {
    type: String,
    default: '09:00'
  },
  callHoursEnd: {
    type: String,
    default: '18:00'
  },
  callDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  callScript: {
    type: String,
    default: ''
  },
  targetAudience: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['inactive', 'active', 'paused', 'completed'],
    default: 'inactive'
  },
  totalLeads: {
    type: Number,
    default: 0
  },
  completedCalls: {
    type: Number,
    default: 0
  },
  successfulCalls: {
    type: Number,
    default: 0
  },
  // Campo oculto para el cliente - ID en Voximplant
  externalId: {
    type: String,
    select: false // No se devuelve por defecto en las consultas
  }
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;

// models/leadModel.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
    default: 'new'
  },
  lastCallDate: {
    type: Date,
    default: null
  },
  callAttempts: {
    type: Number,
    default: 0
  },
  callDuration: {
    type: Number,
    default: 0 // en segundos
  },
  notes: {
    type: String,
    default: ''
  },
  customFields: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;

// models/reportModel.js
const mongoose = require('mongoose');

// Modelo para almacenar reportes generados (para cache)
const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['campaign', 'performance', 'system', 'users'],
    required: true
  },
  filters: {
    type: Object,
    default: {}
  },
  data: {
    type: Object,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 horas TTL (Time-To-Live)
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;

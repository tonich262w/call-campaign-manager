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
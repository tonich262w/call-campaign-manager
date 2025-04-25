// models/leadModel.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
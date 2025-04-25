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
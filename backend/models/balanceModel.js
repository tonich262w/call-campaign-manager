// models/balanceModel.js
const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentBalance: {
    type: Number,
    required: true,
    default: 0
  },
  totalSpent: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Modelo para transacciones
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  type: {
    type: String,
    enum: ['charge', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  // Estos campos solo son visibles para el administrador
  realAmount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'admin'],
    default: 'admin'
  },
  paymentDetails: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Modelo para configuración de precios
const pricingSchema = new mongoose.Schema({
  callRate: {
    type: Number,
    required: true,
    default: 0.10 // Precio mostrado al cliente (inflado)
  },
  callMinuteRate: {
    type: Number,
    required: true,
    default: 0.02 // Precio por minuto mostrado al cliente
  },
  realCallRate: {
    type: Number,
    required: true,
    default: 0.05 // Costo real en Voximplant (oculto)
  },
  realCallMinuteRate: {
    type: Number,
    required: true, 
    default: 0.01 // Costo real por minuto (oculto)
  },
  inflationRate: {
    type: Number,
    required: true,
    default: 2.0 // Factor de inflación (2 = doble de costo)
  },
  minRechargeAmount: {
    type: Number,
    required: true,
    default: 10.0
  },
  active: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Método para calcular precio inflado
pricingSchema.methods.getInflatedRate = function() {
  return this.realCallRate * this.inflationRate;
};

const Balance = mongoose.model('Balance', balanceSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = {
  Balance,
  Transaction,
  Pricing
};
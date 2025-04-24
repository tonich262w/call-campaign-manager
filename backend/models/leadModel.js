const mongoose = require('mongoose');

const leadSchema = mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'called', 'not_answered', 'busy', 'failed', 'do_not_call'],
      default: 'pending',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastCallAt: {
      type: Date,
    },
    nextCallAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    customFields: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
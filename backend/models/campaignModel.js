const mongoose = require('mongoose');

const campaignSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'deleted'],
      default: 'active',
    },
    schedule: {
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5], // Lunes a viernes por defecto
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '18:00',
        },
      },
    },
    settings: {
      maxAttempts: {
        type: Number,
        default: 3,
      },
      retryInterval: {
        type: Number,
        default: 60, // minutos
      },
      callerId: {
        type: String,
        default: '',
      },
    },
    stats: {
      totalLeads: {
        type: Number,
        default: 0,
      },
      processedLeads: {
        type: Number,
        default: 0,
      },
      successfulCalls: {
        type: Number,
        default: 0,
      },
      failedCalls: {
        type: Number,
        default: 0,
      },
      costAccumulated: {
        type: Number,
        default: 0,
      },
    },
    externalId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
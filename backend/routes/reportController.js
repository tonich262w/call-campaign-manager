// Añade estas funciones al archivo controllers/reportController.js

// @desc    Obtener estadísticas generales del usuario
// @route   GET /api/reports/stats
// @access  Private
// Al inicio de reportController.js, añade estos imports si aún no están
const mongoose = require('mongoose');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const User = require('../models/userModel');
const { Transaction } = require('../models/balanceModel');
const Report = require('../models/reportModel');
const getStats = async (req, res) => {
  try {
    // Contar campañas
    const totalCampaigns = await Campaign.countDocuments({ userId: req.user._id });
    const activeCampaigns = await Campaign.countDocuments({
      userId: req.user._id,
      status: 'active',
    });

    // Contar leads
    const totalLeads = await Lead.countDocuments({ userId: req.user._id });
    const processedLeads = await Lead.countDocuments({
      userId: req.user._id,
      status: { $ne: 'new' },
    });

    // Calcular tasa de éxito
    const successfulCalls = await Lead.countDocuments({
      userId: req.user._id,
      status: 'converted',
    });

    const successRate = totalLeads > 0 ? Math.round((successfulCalls / totalLeads) * 100) : 0;

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      processedLeads,
      successfulCalls,
      successRate,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// @desc    Obtener llamadas por día (últimos 7 días)
// @route   GET /api/reports/calls-by-day
// @access  Private
const getCallsByDay = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    // Fecha hace N días
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Agrupar llamadas por día
    const callsByDay = await Lead.aggregate([
      {
        $match: {
          userId: req.user._id,
          lastCallDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$lastCallDate' },
            month: { $month: '$lastCallDate' },
            day: { $dayOfMonth: '$lastCallDate' },
          },
          calls: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [{ $eq: ['$status', 'converted'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day',
                },
              },
            },
          },
          calls: 1,
          successful: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Completar días sin datos
    const result = [];
    const dateMap = {};
    
    // Crear mapa con los datos existentes
    callsByDay.forEach((dayData) => {
      dateMap[dayData.date] = dayData;
    });
    
    // Llenar datos para todos los días en el rango
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      
      if (dateMap[dateStr]) {
        result.push(dateMap[dateStr]);
      } else {
        result.push({
          date: dateStr,
          calls: 0,
          successful: 0,
        });
      }
    }
    
    // Ordenar por fecha ascendente
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener llamadas por día:', error);
    res.status(500).json({ message: 'Error al obtener datos de llamadas' });
  }
};

// @desc    Obtener llamadas recientes
// @route   GET /api/reports/recent-calls
// @access  Private
const getRecentCalls = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentCalls = await Lead.find({
      userId: req.user._id,
      lastCallDate: { $exists: true, $ne: null },
    })
      .sort({ lastCallDate: -1 })
      .limit(limit)
      .select('name phone status lastCallDate callAttempts')
      .lean();

    // Formatear datos para frontend
    const formattedCalls = recentCalls.map((call) => ({
      id: call._id,
      name: call.name,
      phone: call.phone,
      status: call.status,
      time: call.lastCallDate ? new Date(call.lastCallDate).toLocaleTimeString() : 'N/A',
      attempts: call.callAttempts,
    }));

    res.json(formattedCalls);
  } catch (error) {
    console.error('Error al obtener llamadas recientes:', error);
    res.status(500).json({ message: 'Error al obtener llamadas recientes' });
  }
};

// @desc    Obtener balance y transacciones recientes
// @route   GET /api/reports/financial
// @access  Private
const getFinancialReport = async (req, res) => {
  try {
    // Obtener usuario con balance
    const user = await User.findById(req.user._id).select('balance');

    // Obtener transacciones recientes
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calcular gastos totales
    const totalCharges = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Calcular recargas totales
    const totalDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'charge',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.json({
      currentBalance: user.balance,
      recentTransactions,
      totalSpent: totalCharges.length > 0 ? Math.abs(totalCharges[0].total) : 0,
      totalDeposited: totalDeposits.length > 0 ? totalDeposits[0].total : 0,
    });
  } catch (error) {
    console.error('Error al obtener reporte financiero:', error);
    res.status(500).json({ message: 'Error al obtener información financiera' });
  }
};

// Asegúrate de exportar todas las funciones
module.exports = {
  getStats,
  getCallsByDay,
  getRecentCalls,
  getFinancialReport,
  getCampaignReport,
  getUserPerformanceReport,
  getSystemReport,
  getUsersReport
};
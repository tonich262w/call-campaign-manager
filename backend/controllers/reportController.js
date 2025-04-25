// controllers/reportController.js
const mongoose = require('mongoose');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const User = require('../models/userModel');
const { Transaction, Balance } = require('../models/balanceModel');
const Report = require('../models/reportModel');

// @desc    Obtener estadísticas generales del usuario
// @route   GET /api/reports/stats
// @access  Private
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
      .select('name phone status lastCallDate callAttempts callDuration')
      .lean();

    // Formatear datos para frontend
    const formattedCalls = recentCalls.map((call) => ({
      id: call._id,
      name: call.name,
      phone: call.phone,
      status: call.status,
      time: call.lastCallDate ? new Date(call.lastCallDate).toLocaleTimeString() : 'N/A',
      attempts: call.callAttempts,
      duration: call.callDuration ? Math.floor(call.callDuration / 60) + ':' + 
        (call.callDuration % 60).toString().padStart(2, '0') : 'N/A'
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
    // Obtener balance del usuario
    const balance = await Balance.findOne({ userId: req.user._id });
    const currentBalance = balance ? balance.currentBalance : 0;

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
          status: 'completed'
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
          status: 'completed'
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Formatear transacciones para vista
    const formattedTransactions = recentTransactions.map(t => ({
      id: t._id,
      date: t.createdAt,
      type: t.type,
      amount: t.amount,
      description: t.description,
      status: t.status
    }));

    res.json({
      currentBalance,
      recentTransactions: formattedTransactions,
      totalSpent: totalCharges.length > 0 ? Math.abs(totalCharges[0].total) : 0,
      totalDeposited: totalDeposits.length > 0 ? totalDeposits[0].total : 0,
    });
  } catch (error) {
    console.error('Error al obtener reporte financiero:', error);
    res.status(500).json({ message: 'Error al obtener información financiera' });
  }
};

// @desc    Reporte detallado de una campaña específica
// @route   GET /api/reports/campaigns/:id
// @access  Private
const getCampaignReport = async (req, res) => {
  try {
    const { id: campaignId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verificar que la campaña pertenece al usuario
    const campaign = await Campaign.findOne({
      _id: campaignId,
      userId: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Buscar si hay un reporte en caché reciente
    const cacheKey = `${campaignId}-${startDate || 'all'}-${endDate || 'all'}`;
    const cachedReport = await Report.findOne({
      userId: req.user._id,
      reportType: 'campaign',
      'filters.campaignId': campaignId,
      'filters.startDate': startDate || null,
      'filters.endDate': endDate || null,
      generatedAt: { $gte: new Date(Date.now() - 3600000) } // Caché de 1 hora
    });
    
    if (cachedReport) {
      return res.status(200).json(cachedReport.data);
    }
    
    // Construir query para filtrar por fecha si se proporcionan
    const dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    }
    
    // Estadísticas básicas de la campaña
    const basicStats = {
      name: campaign.name,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      totalLeads: campaign.totalLeads,
      completedCalls: campaign.completedCalls,
      successfulCalls: campaign.successfulCalls,
      completionRate: campaign.totalLeads ? 
        (campaign.completedCalls / campaign.totalLeads * 100).toFixed(2) : 0,
      conversionRate: campaign.completedCalls ? 
        (campaign.successfulCalls / campaign.completedCalls * 100).toFixed(2) : 0
    };
    
    // Obtener estadísticas de leads por estado
    const leadStatusStats = await Lead.aggregate([
      { $match: { campaignId: mongoose.Types.ObjectId(campaignId), ...dateFilter } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    // Formatear resultados de estados
    const statusCounts = {
      new: 0,
      contacted: 0,
      qualified: 0,
      unqualified: 0,
      converted: 0
    };
    
    leadStatusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });
    
    // Datos diarios para gráficos (últimos 30 días o duración de la campaña)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const startForDailyStats = campaign.startDate > thirtyDaysAgo ? 
      campaign.startDate : thirtyDaysAgo;
    
    const dailyStats = await Lead.aggregate([
      { 
        $match: { 
          campaignId: mongoose.Types.ObjectId(campaignId),
          lastCallDate: { $gte: startForDailyStats, $lte: today }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$lastCallDate' } 
          },
          calls: { $sum: 1 },
          duration: { $sum: '$callDuration' },
          qualified: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] 
            } 
          },
          converted: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Obtener costos de la campaña (solo lo que se mostró al cliente)
    const campaignTransactions = await Transaction.find({
      campaignId: campaignId,
      type: 'expense',
      status: 'completed'
    }).select('amount description createdAt');
    
    const totalCost = campaignTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Crear objeto de reporte completo
    const reportData = {
      campaignInfo: basicStats,
      leadsByStatus: statusCounts,
      dailyStats: dailyStats,
      transactions: campaignTransactions,
      costSummary: {
        totalCost,
        costPerLead: campaign.totalLeads ? 
          (totalCost / campaign.totalLeads).toFixed(2) : 0,
        costPerSuccessfulCall: campaign.successfulCalls ? 
          (totalCost / campaign.successfulCalls).toFixed(2) : 0
      },
      generatedAt: new Date()
    };
    
    // Guardar reporte en caché
    await Report.create({
      userId: req.user._id,
      reportType: 'campaign',
      filters: {
        campaignId,
        startDate: startDate || null,
        endDate: endDate || null
      },
      data: reportData
    });
    
    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al generar reporte de campaña:', error);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
};

// @desc    Reporte de rendimiento general del usuario
// @route   GET /api/reports/performance
// @access  Private
const getUserPerformanceReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.query; // month, quarter, year
    
    // Determinar rango de fechas según el período
    const today = new Date();
    let startDate;
    
    switch(period) {
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
    }
    
    // Buscar caché
    const cachedReport = await Report.findOne({
      userId,
      reportType: 'performance',
      'filters.period': period,
      generatedAt: { $gte: new Date(Date.now() - 86400000) } // Caché de 24 horas
    });
    
    if (cachedReport) {
      return res.status(200).json(cachedReport.data);
    }
    
    // Estadísticas generales de campañas
    const campaigns = await Campaign.find({
      userId,
      createdAt: { $gte: startDate }
    });
    
    // Estadísticas de llamadas
    const callStats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalLeads: campaigns.reduce((sum, c) => sum + c.totalLeads, 0),
      completedCalls: campaigns.reduce((sum, c) => sum + c.completedCalls, 0),
      successfulCalls: campaigns.reduce((sum, c) => sum + c.successfulCalls, 0)
    };
    
    // Tasa de éxito
    callStats.completionRate = callStats.totalLeads ? 
      (callStats.completedCalls / callStats.totalLeads * 100).toFixed(2) : 0;
    callStats.conversionRate = callStats.completedCalls ? 
      (callStats.successfulCalls / callStats.completedCalls * 100).toFixed(2) : 0;
    
    // Gastos y transacciones
    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: startDate }
    });
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const recharges = transactions.filter(t => t.type === 'charge');
    
    const financialStats = {
      totalSpent: expenses.reduce((sum, t) => sum + t.amount, 0),
      totalRecharged: recharges.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length
    };
    
    // Top campañas por rendimiento
    const topCampaigns = [...campaigns]
      .sort((a, b) => {
        // Primero ordenar por tasa de conversión
        const aConvRate = a.completedCalls ? (a.successfulCalls / a.completedCalls) : 0;
        const bConvRate = b.completedCalls ? (b.successfulCalls / b.completedCalls) : 0;
        return bConvRate - aConvRate;
      })
      .slice(0, 5)
      .map(c => ({
        id: c._id,
        name: c.name,
        totalLeads: c.totalLeads,
        completedCalls: c.completedCalls,
        successfulCalls: c.successfulCalls,
        conversionRate: c.completedCalls ? 
          (c.successfulCalls / c.completedCalls * 100).toFixed(2) : 0
      }));
    
    // Tendencia por mes (para reportes trimestrales o anuales)
    let monthlyTrend = [];
    
    if (period === 'quarter' || period === 'year') {
      // Agrupar datos por mes
      const monthlyData = {};
      
      // Inicializar meses
      const months = [];
      let currentDate = new Date(startDate);
      while (currentDate <= today) {
        const monthKey = currentDate.toISOString().substring(0, 7); // YYYY-MM
        months.push(monthKey);
        monthlyData[monthKey] = {
          calls: 0,
          successful: 0,
          expenses: 0
        };
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Llenar datos de transacciones
      expenses.forEach(t => {
        const monthKey = t.createdAt.toISOString().substring(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += t.amount;
        }
      });
      
      // Llenar datos de llamadas (este es un enfoque simplificado; en un sistema real deberías
      // tener un registro detallado de cada llamada)
      campaigns.forEach(c => {
        // Suponemos que las llamadas se distribuyen uniformemente en el período
        const campaignMonths = months.filter(m => {
          const monthDate = new Date(m + '-01');
          return monthDate >= c.startDate && monthDate <= (c.endDate > today ? today : c.endDate);
        });
        
        if (campaignMonths.length > 0) {
          const callsPerMonth = c.completedCalls / campaignMonths.length;
          const successfulPerMonth = c.successfulCalls / campaignMonths.length;
          
          campaignMonths.forEach(m => {
            monthlyData[m].calls += Math.round(callsPerMonth);
            monthlyData[m].successful += Math.round(successfulPerMonth);
          });
        }
      });
      
      // Formatear para el gráfico
      monthlyTrend = months.map(m => ({
        month: m,
        calls: monthlyData[m].calls,
        successful: monthlyData[m].successful,
        expenses: monthlyData[m].expenses
      }));
    }
    
    // Crear el reporte completo
    const reportData = {
      period,
      callStats,
      financialStats,
      topCampaigns,
      monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : undefined,
      generatedAt: new Date()
    };
    
    // Guardar en caché
    await Report.create({
      userId,
      reportType: 'performance',
      filters: { period },
      data: reportData
    });
    
    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al generar reporte de rendimiento:', error);
    res.status(500).json({ message: 'Error al generar el reporte de rendimiento' });
  }
};

// @desc    Reporte general del sistema (admin)
// @route   GET /api/reports/admin/system
// @access  Private/Admin
const getSystemReport = async (req, res) => {
  try {
    // Verificar que es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Buscar caché
    const cachedReport = await Report.findOne({
      userId: req.user._id,
      reportType: 'system',
      generatedAt: { $gte: new Date(Date.now() - 3600000) } // Caché de 1 hora
    });
    
    if (cachedReport) {
      return res.status(200).json(cachedReport.data);
    }
    
    // Estadísticas de usuarios
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ isAdmin: true });
    
    // Estadísticas de campañas
    const campaignStats = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalLeads: { $sum: '$totalLeads' },
          completedCalls: { $sum: '$completedCalls' },
          successfulCalls: { $sum: '$successfulCalls' }
        }
      }
    ]);
    
    // Formatear estadísticas de campañas
    const formattedCampaignStats = {
      total: 0,
      active: 0,
      paused: 0,
      completed: 0,
      inactive: 0,
      totalLeads: 0,
      completedCalls: 0,
      successfulCalls: 0
    };
    
    campaignStats.forEach(stat => {
      formattedCampaignStats[stat._id] = stat.count;
      formattedCampaignStats.total += stat.count;
      formattedCampaignStats.totalLeads += stat.totalLeads;
      formattedCampaignStats.completedCalls += stat.completedCalls;
      formattedCampaignStats.successfulCalls += stat.successfulCalls;
    });
    
    // Estadísticas financieras
    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          totalRealAmount: { $sum: '$realAmount' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Formatear estadísticas financieras
    const formattedFinancialStats = {
      totalRecharges: 0,
      totalRechargeAmount: 0,
      totalExpenses: 0,
      totalExpenseAmount: 0,
      totalRealCost: 0,
      totalProfit: 0
    };
    
    financialStats.forEach(stat => {
      if (stat._id === 'charge') {
        formattedFinancialStats.totalRecharges = stat.count;
        formattedFinancialStats.totalRechargeAmount = stat.totalAmount;
      } else if (stat._id === 'expense') {
        formattedFinancialStats.totalExpenses = stat.count;
        formattedFinancialStats.totalExpenseAmount = stat.totalAmount;
        formattedFinancialStats.totalRealCost = stat.totalRealAmount;
        formattedFinancialStats.totalProfit = stat.totalProfit;
      }
    });
    
    // Calcular margen de beneficio
    formattedFinancialStats.profitMargin = formattedFinancialStats.totalExpenseAmount ? 
      (formattedFinancialStats.totalProfit / formattedFinancialStats.totalExpenseAmount * 100).toFixed(2) : 0;
    
    // Tendencia de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyTrend = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          realAmount: { $sum: '$realAmount' },
          profit: { $sum: '$profit' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    // Formatear tendencia diaria
    const trend = {};
    
    dailyTrend.forEach(day => {
      const date = day._id.date;
      if (!trend[date]) {
        trend[date] = {
          date,
          recharges: 0,
          expenses: 0,
          realCost: 0,
          profit: 0
        };
      }
      
      if (day._id.type === 'charge') {
        trend[date].recharges = day.amount;
      } else if (day._id.type === 'expense') {
        trend[date].expenses = day.amount;
        trend[date].realCost = day.realAmount;
        trend[date].profit = day.profit;
      }
    });
    
    const formattedTrend = Object.values(trend);
    
    // Crear reporte completo
    const reportData = {
      userStats: {
        total: userCount,
        admins: adminCount,
        regularUsers: userCount - adminCount
      },
      campaignStats: formattedCampaignStats,
      financialStats: formattedFinancialStats,
      dailyTrend: formattedTrend,
      generatedAt: new Date()
    };
    
    // Guardar en caché
    await Report.create({
      userId: req.user._id,
      reportType: 'system',
      filters: {},
      data: reportData
    });
    
    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al generar reporte de sistema:', error);
    res.status(500).json({ message: 'Error al generar el reporte del sistema' });
  }
};

// @desc    Reporte de usuarios para administradores
// @route   GET /api/reports/admin/users
// @access  Private/Admin
const getUsersReport = async (req, res) => {
  try {
    // Verificar que es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Parámetros de filtrado
    const { sortBy, limit } = req.query;
    const limitVal = parseInt(limit) || 10;
    
    // Verificar caché
    const cacheKey = `users-${sortBy || 'revenue'}-${limitVal}`;
    const cachedReport = await Report.findOne({
      userId: req.user._id,
      reportType: 'users',
      'filters.sortBy': sortBy || 'revenue',
      'filters.limit': limitVal,
      generatedAt: { $gte: new Date(Date.now() - 3600000) } // 1 hora
    });
    
    if (cachedReport) {
      return res.status(200).json(cachedReport.data);
    }
    
    // Obtener usuarios (excluyendo admins)
    const users = await User.find({ isAdmin: false })
      .select('_id name email company createdAt');
    
    // Para cada usuario, obtener estadísticas agregadas
    const userStats = await Promise.all(users.map(async (user) => {
      // Campañas
      const campaigns = await Campaign.find({ userId: user._id });
      
      // Transacciones
      const transactions = await Transaction.aggregate([
        {
          $match: { userId: mongoose.Types.ObjectId(user._id) }
        },
        {
          $group: {
            _id: '$type',
            amount: { $sum: '$amount' },
            realAmount: { $sum: '$realAmount' },
            profit: { $sum: '$profit' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Formatear datos financieros
      let recharges = 0;
      let rechargeAmount = 0;
      let expenses = 0;
      let expenseAmount = 0;
      let profit = 0;
      
      transactions.forEach(t => {
        if (t._id === 'charge') {
          recharges = t.count;
          rechargeAmount = t.amount;
        } else if (t._id === 'expense') {
          expenses = t.count;
          expenseAmount = t.amount;
          profit = t.profit;
        }
      });
      
      // Obtener saldo actual
      const balance = await Balance.findOne({ userId: user._id });
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        joinedDate: user.createdAt,
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter(c => c.status === 'active').length,
          totalLeads: campaigns.reduce((sum, c) => sum + c.totalLeads, 0),
          completedCalls: campaigns.reduce((sum, c) => sum + c.completedCalls, 0)
        },
        financial: {
          totalSpent: expenseAmount,
          totalProfit: profit,
          recharges,
          rechargeAmount,
          currentBalance: balance ? balance.currentBalance : 0
        }
      };
    }));
    
    // Ordenar según el criterio
    let sortedUsers;
    switch(sortBy) {
      case 'campaigns':
        sortedUsers = userStats.sort((a, b) => b.campaigns.total - a.campaigns.total);
        break;
      case 'calls':
        sortedUsers = userStats.sort((a, b) => b.campaigns.completedCalls - a.campaigns.completedCalls);
        break;
      case 'profit':
        sortedUsers = userStats.sort((a, b) => b.financial.totalProfit - a.financial.totalProfit);
        break;
      case 'recent':
        sortedUsers = userStats.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
        break;
      case 'revenue':
      default:
        sortedUsers = userStats.sort((a, b) => b.financial.totalSpent - a.financial.totalSpent);
    }
    
    // Limitar resultados
    const topUsers = sortedUsers.slice(0, limitVal);
    
    // Calcular totales
    const totals = userStats.reduce((acc, user) => {
      return {
        totalUsers: acc.totalUsers + 1,
        totalCampaigns: acc.totalCampaigns + user.campaigns.total,
        totalCalls: acc.totalCalls + user.campaigns.completedCalls,
        totalRevenue: acc.totalRevenue + user.financial.totalSpent,
        totalProfit: acc.totalProfit + user.financial.totalProfit
      };
    }, {
      totalUsers: 0,
      totalCampaigns: 0,
      totalCalls: 0,
      totalRevenue: 0,
      totalProfit: 0
    });
    
    // Construir reporte
    const reportData = {
      summary: totals,
      users: topUsers,
      sortBy: sortBy || 'revenue',
      generatedAt: new Date()
    };
    
    // Guardar en caché
    await Report.create({
      userId: req.user._id,
      reportType: 'users',
      filters: {
        sortBy: sortBy || 'revenue',
        limit: limitVal
      },
      data: reportData
    });
    
    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al generar reporte de usuarios:', error);
    res.status(500).json({ message: 'Error al generar el reporte de usuarios' });
  }
};

// Exportar todas las funciones
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
// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const { Balance, Transaction, Pricing } = require('../models/balanceModel');

// Middleware para proteger rutas (requiere autenticación)
const auth = (req, res, next) => {
  // Obtener token de x-auth-token o Authorization header
  let token = req.header('x-auth-token');
  
  // Si no hay token en x-auth-token, buscar en Authorization
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Extraer el token después de 'Bearer '
      console.log('Token obtenido de Authorization header');
    }
  } else {
    console.log('Token obtenido de x-auth-token header');
  }
  
  if (!token) {
    console.log('No se encontró token en ninguna cabecera');
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error al verificar token en middleware auth:', err);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Ruta para obtener datos del dashboard
router.get('/', auth, async (req, res) => {
  try {
    console.log('Obteniendo datos del dashboard para usuario:', req.user.id);
    const userId = mongoose.Types.ObjectId(req.user.id);
    
    // Consultar campañas del usuario
    const campaigns = await Campaign.find({ userId });
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalCampaigns = campaigns.length;
    
    // Consultar leads del usuario
    const leads = await Lead.find({ userId });
    const totalLeads = leads.length;
    
    // Calcular llamadas pendientes y completadas
    const completedCalls = leads.filter(l => l.callAttempts > 0).length;
    const pendingCalls = totalLeads - completedCalls;
    
    // Calcular tasa de contacto (porcentaje de leads contactados)
    const contactRate = totalLeads > 0 ? Math.round((completedCalls / totalLeads) * 100) : 0;
    
    // Consultar saldo disponible
    let availableBalance = 0;
    const balanceInfo = await Balance.findOne({ userId });
    if (balanceInfo) {
      availableBalance = balanceInfo.currentBalance;
    }
    
    // Obtener campañas recientes (ordenadas por fecha de creación)
    const recentCampaigns = await Campaign.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id name status totalLeads completedCalls');
    
    // Calcular progreso para cada campaña
    const recentCampaignsWithProgress = recentCampaigns.map(campaign => {
      const progress = campaign.totalLeads > 0 
        ? Math.round((campaign.completedCalls / campaign.totalLeads) * 100) 
        : 0;
      
      return {
        _id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        progress
      };
    });
    
    // Obtener actividad reciente (transacciones y cambios en campañas)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    // Formatear transacciones como actividades
    const transactionActivities = recentTransactions.map(transaction => ({
      _id: transaction._id,
      type: 'payment',
      description: `${transaction.type === 'charge' ? 'Recarga' : 'Gasto'} de saldo por $${transaction.amount.toFixed(2)}`,
      date: transaction.createdAt
    }));
    
    // Combinar con actividades de campaña (aquí podríamos añadir más tipos de actividad)
    const recentActivity = [...transactionActivities];
    
    // Construir objeto de respuesta
    const dashboardData = {
      activeCampaigns,
      totalCampaigns,
      pendingCalls,
      completedCalls,
      totalLeads,
      contactRate,
      availableBalance,
      recentCampaigns: recentCampaignsWithProgress,
      recentActivity
    };
    
    // Si el usuario es admin, agregar estadísticas de administrador
    if (req.user.role === 'admin') {
      // Obtener todas las transacciones
      const allTransactions = await Transaction.find({});
      
      // Calcular ingresos totales (transacciones de tipo 'charge')
      const totalRevenue = allTransactions
        .filter(t => t.type === 'charge')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calcular costo operativo total (suma de realAmount en transacciones de tipo 'expense')
      const operationalCost = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.realAmount, 0);
      
      // Calcular ingresos y costos del mes actual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = allTransactions.filter(t => {
        const transDate = new Date(t.createdAt);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      });
      
      const currentMonthRevenue = currentMonthTransactions
        .filter(t => t.type === 'charge')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const currentMonthCost = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.realAmount, 0);
      
      // Contar usuarios activos y nuevos
      const activeUsers = await Balance.countDocuments({});
      
      // Contar usuarios nuevos (registrados este mes)
      const User = mongoose.model('User');
      const newUsers = await User.countDocuments({
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      });
      
      dashboardData.adminStats = {
        totalRevenue,
        currentMonthRevenue,
        operationalCost,
        currentMonthCost,
        activeUsers,
        newUsers
      };
    }
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({ 
      message: 'Error al cargar datos del dashboard',
      error: error.message
    });
  }
});

module.exports = router;

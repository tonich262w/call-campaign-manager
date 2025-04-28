// controllers/userController.js
const User = require('../models/userModel');
const { Balance, Transaction } = require('../models/balanceModel');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener usuarios con paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    // Filtros
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Ejecutar consulta
    const users = await User.find(filter)
      .select('-password') // No devolver la contraseña
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Obtener total para paginación
    const total = await User.countDocuments(filter);

    // Para cada usuario, obtener información adicional
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      // Obtener saldo
      const balance = await Balance.findOne({ userId: user._id });
      // Obtener estadísticas de campañas
      const campaignStats = await Campaign.aggregate([
        { $match: { userId: user._id } },
        { $group: {
            _id: null,
            totalCampaigns: { $sum: 1 },
            activeCampaigns: { 
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
            }
          }
        }
      ]);
      // Obtener total de leads
      const leadCount = await Lead.countDocuments({ userId: user._id });

      return {
        ...user.toObject(),
        balance: balance ? balance.currentBalance : 0,
        totalCampaigns: campaignStats.length > 0 ? campaignStats[0].totalCampaigns : 0,
        activeCampaigns: campaignStats.length > 0 ? campaignStats[0].activeCampaigns : 0,
        totalLeads: leadCount
      };
    }));

    res.status(200).json({
      users: usersWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener detalles de un usuario específico (admin)
const getUserDetails = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { userId } = req.params;

    // Obtener usuario
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener saldo y transacciones
    const balance = await Balance.findOne({ userId });
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Obtener campañas
    const campaigns = await Campaign.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Obtener estadísticas de leads
    const leadStats = await Lead.aggregate([
      { $match: { userId: user._id } },
      { $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          contactedLeads: { 
            $sum: { $cond: [{ $ne: ["$status", "new"] }, 1, 0] }
          },
          convertedLeads: { 
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      user,
      balance: balance ? balance.currentBalance : 0,
      totalSpent: balance ? balance.totalSpent : 0,
      transactions,
      campaigns,
      leadStats: leadStats.length > 0 ? {
        totalLeads: leadStats[0].totalLeads,
        contactedLeads: leadStats[0].contactedLeads,
        convertedLeads: leadStats[0].convertedLeads,
        contactRate: leadStats[0].totalLeads > 0 
          ? Math.round((leadStats[0].contactedLeads / leadStats[0].totalLeads) * 100) 
          : 0,
        conversionRate: leadStats[0].contactedLeads > 0 
          ? Math.round((leadStats[0].convertedLeads / leadStats[0].contactedLeads) * 100) 
          : 0
      } : {
        totalLeads: 0,
        contactedLeads: 0,
        convertedLeads: 0,
        contactRate: 0,
        conversionRate: 0
      }
    });
  } catch (error) {
    console.error('Error al obtener detalles de usuario:', error);
    res.status(500).json({ message: 'Error al obtener detalles de usuario' });
  }
};

// Crear un nuevo usuario (admin)
const createUser = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: true
    });

    // Crear registro de balance
    await Balance.create({
      userId: user._id,
      currentBalance: 0,
      totalSpent: 0
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Actualizar un usuario (admin)
const updateUser = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { userId } = req.params;
    const { name, email, role, isActive, password } = req.body;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      user.email = email;
    }

    // Actualizar campos
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Eliminar un usuario (admin)
const deleteUser = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { userId } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No permitir eliminar el propio usuario admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    // Opción 1: Eliminar completamente (no recomendado para datos importantes)
    // await User.findByIdAndDelete(userId);

    // Opción 2: Desactivar usuario (mejor práctica)
    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// Obtener estadísticas de usuarios (admin)
const getUserStats = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Total de usuarios
    const totalUsers = await User.countDocuments();
    
    // Usuarios activos
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Usuarios por rol
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Usuarios nuevos este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    
    // Usuarios con saldo
    const usersWithBalance = await Balance.countDocuments({ currentBalance: { $gt: 0 } });
    
    // Saldo total en el sistema
    const balanceResult = await Balance.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$currentBalance' } } }
    ]);
    
    res.status(200).json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      newUsers,
      usersWithBalance,
      totalBalance: balanceResult.length > 0 ? balanceResult[0].totalBalance : 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de usuarios' });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};

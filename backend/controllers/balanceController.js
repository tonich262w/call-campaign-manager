const asyncHandler = require('express-async-handler');
const balanceService = require('../services/balanceService');
const Transaction = require('../models/transactionModel');

// @desc    Obtener saldo del usuario
// @route   GET /api/balance
// @access  Private
const getUserBalance = asyncHandler(async (req, res) => {
  const balance = await balanceService.getUserBalance(req.user._id);
  res.json({ balance });
});

// @desc    Añadir saldo al usuario
// @route   POST /api/balance/add
// @access  Private
const addBalance = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, metadata } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('El monto debe ser mayor a cero');
  }

  const result = await balanceService.addBalance(
    req.user._id,
    parseFloat(amount),
    paymentMethod,
    metadata
  );

  res.json({
    success: true,
    transaction: result.transaction,
    newBalance: result.newBalance,
  });
});

// @desc    Obtener historial de transacciones
// @route   GET /api/balance/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Transaction.countDocuments({ user: req.user._id });

  res.json({
    transactions,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  });
});

module.exports = {
  getUserBalance,
  addBalance,
  getTransactions,
};
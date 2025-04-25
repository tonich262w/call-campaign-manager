// Rutas para usuarios normales
router.get('/info', protect, getUserBalance);
router.get('/transactions', protect, getTransactionHistory);
router.post('/recharge', protect, rechargeBalance);
router.post('/check-balance', protect, checkSufficientBalance);

// Rutas solo para administradores
router.get('/admin/transactions', protect, admin, getAdminTransactions);
router.post('/admin/pricing', protect, admin, updatePricing);
router.post('/admin/manual-recharge', protect, admin, addBalanceManually);
router.get('/admin/summary', protect, admin, getFinancialSummary);

module.exports = router;

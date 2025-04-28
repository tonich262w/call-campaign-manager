// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Admin } from '../../services/apiService';
import { format } from 'date-fns';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaPhoneAlt, 
  FaChartLine, 
  FaUserPlus, 
  FaSync,
  FaEdit,
  FaTrash,
  FaSearch
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cargar datos reales desde la API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas del dashboard
      const dashboardStats = await Admin.getDashboardStats();
      setStats(dashboardStats);

      // Obtener resumen financiero
      const financialData = await Admin.getFinancialSummary();
      setFinancialSummary(financialData);

      // Obtener estadísticas de usuarios
      const userStatsData = await Admin.getUserStats();
      setUserStats(userStatsData);

      // Obtener lista de usuarios con paginación y filtros
      const filters = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (roleFilter) {
        filters.role = roleFilter;
      }
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const usersResponse = await Admin.getUsers(
        pagination.page,
        pagination.limit,
        filters
      );
      
      setUsers(usersResponse.users);
      setPagination({
        page: usersResponse.page,
        limit: usersResponse.limit,
        total: usersResponse.total,
        pages: usersResponse.pages
      });
      
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      setError('Error al cargar los datos del panel de administración');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, searchTerm, roleFilter, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se activará por el efecto que observa searchTerm
  };

  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro que desea desactivar este usuario?')) {
      try {
        // Eliminar usuario a través de la API
        await Admin.deleteUser(userId);
        
        // Recargar datos para actualizar estadísticas
        loadData();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error al desactivar usuario');
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateUser}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
          >
            <FaUserPlus className="mr-2" />
            Crear Usuario
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded
              ${(loading || refreshing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && !stats && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando información del panel de administración...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={loadData}
            className="text-red-700 underline mt-2"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      {userStats && financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuarios activos</p>
                <p className="text-xl font-semibold">{userStats.activeUsers}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {userStats.newUsersThisMonth || 12} nuevos este mes
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <FaMoneyBillWave className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos totales</p>
                <p className="text-xl font-semibold">${financialSummary.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Beneficio: ${financialSummary.profit.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <FaPhoneAlt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Campañas activas</p>
                <p className="text-xl font-semibold">{stats?.activeCampaigns || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {stats?.totalCampaigns || 0} campañas totales
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Crecimiento mensual</p>
                <p className="text-xl font-semibold">{financialSummary.monthlyGrowth}%</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {userStats.usersWithCampaigns} usuarios con campañas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gestión de usuarios */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Gestión de Usuarios</h2>
          <button 
            onClick={handleCreateUser}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
          >
            <FaUserPlus className="mr-2" />
            Crear Usuario
          </button>
        </div>
        
        {/* Filtros */}
        <div className="px-6 py-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg pl-10"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuarios</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Filtrar
            </button>
          </form>
        </div>
        
        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campañas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${user.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.totalCampaigns} ({user.activeCampaigns} activas)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditUser(user._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user._id === user?._id}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.page === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Anterior
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === i + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.pages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

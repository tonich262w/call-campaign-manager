// src/pages/admin/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Admin } from '../../services/apiService';
import { format } from 'date-fns';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaPhoneAlt,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaLock
} from 'react-icons/fa';

const UserDetails = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true,
    password: ''
  });
  const [addBalanceMode, setAddBalanceMode] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNotes, setBalanceNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cargar datos del usuario desde la API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener datos del usuario desde la API
        const data = await Admin.getUserDetails(userId);
        setUserData(data);
        
        // Inicializar formulario con datos actuales
        setFormData({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          password: ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Error al cargar los detalles del usuario');
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Crear objeto con datos a actualizar
      const updateData = { ...formData };
      
      // Si no se proporciona contraseña, eliminarla del objeto
      if (!updateData.password) {
        delete updateData.password;
      }
      
      // Actualizar el usuario en la API
      await Admin.updateUser(userId, updateData);
      
      // Recargar datos del usuario
      const data = await Admin.getUserDetails(userId);
      setUserData(data);
      
      // Salir del modo edición
      setEditMode(false);
      setSubmitting(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error al actualizar el usuario');
      setSubmitting(false);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Añadir saldo manualmente a través de la API
      await Admin.addBalanceManually(
        userId, 
        parseFloat(balanceAmount), 
        balanceNotes
      );
      
      // Recargar datos del usuario
      const data = await Admin.getUserDetails(userId);
      setUserData(data);
      
      // Resetear formulario
      setBalanceAmount('');
      setBalanceNotes('');
      setAddBalanceMode(false);
      setSubmitting(false);
    } catch (err) {
      console.error('Error adding balance:', err);
      setError('Error al añadir saldo');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Cargando información del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="text-red-700 underline mt-2"
        >
          Volver al panel de administración
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-6">
        <p>No se encontró información del usuario</p>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="text-blue-500 underline mt-2"
        >
          Volver al panel de administración
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Detalles del Usuario</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del usuario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Información del Usuario</h2>
              {!editMode ? (
                <button 
                  onClick={() => setEditMode(true)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FaEdit className="mr-1" /> Editar
                </button>
              ) : (
                <button 
                  onClick={() => setEditMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              )}
            </div>
            
            <div className="p-6">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Usuario activo</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña (dejar en blanco para mantener la actual)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{userData.user.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userData.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Rol</p>
                    <p className="font-medium capitalize">{userData.user.role}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userData.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {userData.user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="font-medium">
                      {format(new Date(userData.user.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Último Acceso</p>
                    <p className="font-medium">
                      {userData.user.lastLogin 
                        ? format(new Date(userData.user.lastLogin), 'dd/MM/yyyy HH:mm')
                        : 'Nunca'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Estadísticas de leads */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Estadísticas de Leads</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total de Leads</p>
                  <p className="text-2xl font-semibold">{userData.leadStats.totalLeads}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Tasa de Contacto</p>
                  <p className="text-2xl font-semibold">{userData.leadStats.contactRate}%</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Tasa de Conversión</p>
                  <p className="text-2xl font-semibold">{userData.leadStats.conversionRate}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Campañas recientes */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Campañas Recientes</h2>
            </div>
            
            <div className="p-6">
              {userData.campaigns.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {userData.campaigns.map(campaign => (
                    <div key={campaign._id} className="py-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">{campaign.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            campaign.status === 'active' ? 'bg-green-500' : 
                            campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-xs text-gray-500 capitalize">{campaign.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          <FaPhoneAlt className="text-gray-400 mr-1 h-3 w-3" />
                          <span className="text-xs text-gray-500">{campaign.totalLeads} leads</span>
                        </div>
                        <button
                          onClick={() => navigate(`/campaigns/${campaign._id}`)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay campañas recientes</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Saldo y transacciones */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Saldo y Transacciones</h2>
              {!addBalanceMode ? (
                <button 
                  onClick={() => setAddBalanceMode(true)}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <FaMoneyBillWave className="mr-1" /> Añadir Saldo
                </button>
              ) : (
                <button 
                  onClick={() => setAddBalanceMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              )}
            </div>
            
            <div className="p-6">
              {addBalanceMode ? (
                <form onSubmit={handleAddBalance} className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad a añadir ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={balanceNotes}
                      onChange={(e) => setBalanceNotes(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !balanceAmount}
                    className="w-full flex justify-center items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-2" />
                        Añadir Saldo
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Saldo Actual</p>
                    <p className="text-2xl font-semibold">${userData.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Gastado</p>
                    <p className="text-lg font-medium">${userData.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              )}
              
              <h3 className="text-sm font-medium text-gray-700 mb-3">Transacciones Recientes</h3>
              
              {userData.transactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {userData.transactions.map(transaction => (
                    <div key={transaction.id} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === 'charge' ? 'Recarga' : 'Consumo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <p className={`text-sm font-medium ${
                          transaction.type === 'charge' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'charge' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay transacciones recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import useAuth from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';

// Modelo de Lead ficticio para la demostración
const Lead = {
  getAll: () => {
    return Promise.resolve([
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@ejemplo.com',
        phone: '+1234567890',
        company: 'TechCorp',
        status: 'new',
        campaignId: 1,
        campaignName: 'Campaña Ventas Q1',
        createdAt: new Date('2025-01-20')
      },
      {
        id: 2,
        name: 'María López',
        email: 'maria.lopez@ejemplo.com',
        phone: '+0987654321',
        company: 'InnovaSA',
        status: 'contacted',
        campaignId: 1,
        campaignName: 'Campaña Ventas Q1',
        createdAt: new Date('2025-01-21')
      },
      {
        id: 3,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@ejemplo.com',
        phone: '+1122334455',
        company: 'GlobalTech',
        status: 'qualified',
        campaignId: 2,
        campaignName: 'Seguimiento Clientes',
        createdAt: new Date('2025-01-22')
      }
    ]);
  },
  getByCampaign: (campaignId) => {
    const leads = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@ejemplo.com',
        phone: '+1234567890',
        company: 'TechCorp',
        status: 'new',
        campaignId: 1,
        campaignName: 'Campaña Ventas Q1',
        createdAt: new Date('2025-01-20')
      },
      {
        id: 2,
        name: 'María López',
        email: 'maria.lopez@ejemplo.com',
        phone: '+0987654321',
        company: 'InnovaSA',
        status: 'contacted',
        campaignId: 1,
        campaignName: 'Campaña Ventas Q1',
        createdAt: new Date('2025-01-21')
      },
      {
        id: 3,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@ejemplo.com',
        phone: '+1122334455',
        company: 'GlobalTech',
        status: 'qualified',
        campaignId: 2,
        campaignName: 'Seguimiento Clientes',
        createdAt: new Date('2025-01-22')
      }
    ];
    return Promise.resolve(leads.filter(lead => lead.campaignId === Number(campaignId)));
  },
  importLeads: (campaignId, leads) => {
    return Promise.resolve({ success: true, count: leads.length });
  },
  update: (id, data) => {
    return Promise.resolve({ id, ...data });
  },
  delete: (id) => {
    return Promise.resolve({ success: true });
  }
};

// Componente Dashboard simple
const DashboardPage = () => {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCampaigns: 0,
    pendingCalls: 0,
    completedCalls: 0
  });

  useEffect(() => {
    setStats({
      activeCampaigns: 2,
      totalCampaigns: 3,
      pendingCalls: 157,
      completedCalls: 243
    });
  }, []);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold mb-6">Panel de Control</h1>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Campañas</h3>
          <p className="card-value">{stats.activeCampaigns}</p>
          <p>Campañas activas</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Llamadas Pendientes</h3>
          <p className="card-value">{stats.pendingCalls}</p>
          <p>Por realizar</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Llamadas Completadas</h3>
          <p className="card-value">{stats.completedCalls}</p>
          <p>Total realizado</p>
        </div>
      </div>
    </div>
  );
};

// Componente Campaigns
const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Campaña Ventas Q1',
      status: 'active',
      totalLeads: 350,
      completedCalls: 208,
    },
    {
      id: 2,
      name: 'Seguimiento Clientes',
      status: 'paused',
      totalLeads: 120,
      completedCalls: 89,
    }
  ]);

  const handlePauseCampaign = (id) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? {...campaign, status: 'paused'} : campaign
    ));
  };

  const handleResumeCampaign = (id) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? {...campaign, status: 'active'} : campaign
    ));
  };

  return (
    <div className="campaigns-page">
      <div className="page-actions">
        <button className="primary-button" onClick={() => window.location.href = '/campaigns/new'}>
          Nueva Campaña
        </button>
      </div>
      
      <div className="campaigns-list">
        {campaigns.map(campaign => (
          <div className="campaign-card" key={campaign.id}>
            <div className="campaign-header">
              <h3>{campaign.name}</h3>
              <span className={`campaign-status ${campaign.status}`}>

                {campaign.status === 'active' ? 'Activa' : 'Pausada'}
              </span>
            </div>
            <div className="campaign-stats">
              <div className="stat-item">
                <span className="stat-label">Leads</span>
                <span className="stat-value">{campaign.totalLeads}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completadas</span>
                <span className="stat-value">{campaign.completedCalls}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasa</span>
                <span className="stat-value">
                  {Math.round((campaign.completedCalls / campaign.totalLeads) * 100)}%
                </span>
              </div>
            </div>
            <div className="campaign-actions">
              <button 
                className="action-button" 
                onClick={() => window.location.href = `/campaigns/${campaign.id}`}

              >
                Ver
              </button>
              
              {campaign.status === 'active' ? (
                <button 
                  className="action-button warning" 
                  onClick={() => handlePauseCampaign(campaign.id)}
                >
                  Pausar
                </button>
              ) : (
                <button 
                  className="action-button success" 
                  onClick={() => handleResumeCampaign(campaign.id)}
                >
                  Reanudar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente NewCampaign
const NewCampaignPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    timezone: 'GMT-5',
    callHoursStart: '09:00',
    callHoursEnd: '18:00',
    callDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    maxAttempts: 3,
    callScript: '',
    targetAudience: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // eslint-disable-next-line no-unused-vars
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      callDays: {
        ...prevState.callDays,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    if (!formData.endDate) newErrors.endDate = 'La fecha de finalización es obligatoria';
    if (formData.endDate < formData.startDate) newErrors.endDate = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    
    const hasSelectedDay = Object.values(formData.callDays).some(day => day);
    if (!hasSelectedDay) newErrors.callDays = 'Debes seleccionar al menos un día';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Datos de la campaña a enviar:', formData);
      
      setTimeout(() => {
        alert('¡Campaña creada exitosamente!');
        window.location.href = '/campaigns';
      }, 1000);
    } catch (error) {
      console.error('Error al crear la campaña:', error);
      setErrors({ form: 'Error al crear la campaña. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => {
    window.location.href = '/campaigns';
  };

  return (
    <div className="campaign-form-container">
      <h2>Crear Nueva Campaña</h2>
      
      {errors.form && <div className="form-error">{errors.form}</div>}
      
      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nombre de la Campaña *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="startDate">Fecha de Inicio *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'input-error' : ''}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>
            
            <div className="form-group half">
              <label htmlFor="endDate">Fecha de Finalización *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'input-error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="button secondary" 
            onClick={cancelForm}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="button primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Componente para detalles de campaña
const CampaignDetail = () => {
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  
  // Status colors y labels para los diferentes estados
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800'
  };
  
  const statusLabels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No calificado',
    converted: 'Convertido'
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCampaign({
        id: '1',
        name: 'Campaña Ventas Q1',
        description: 'Campaña para aumentar ventas en el primer trimestre',
        startDate: '2025-01-15',
        endDate: '2025-03-31',
        status: 'active',
        timezone: 'GMT-5',
        callHoursStart: '09:00',
        callHoursEnd: '18:00',
        callDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        maxAttempts: 3,
        callScript: 'Hola, mi nombre es [Nombre del Agente]. Estoy llamando de parte de [Empresa].',
        targetAudience: 'Empresas pequeñas y medianas en el sector tecnológico',
        totalLeads: 350,
        completedCalls: 208,
        successfulCalls: 76
      });
      
	  function App() {
  return (
    <Container>
      <Row>
        <Col>
          <Card className="my-3">
            <Card.Body>
              <Card.Title>Call Campaign Manager</Card.Title>
              <Card.Text>Gestiona tus campañas de llamadas</Card.Text>
              <Button variant="primary">Iniciar</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
      // Cargar los leads de la campaña
      Lead.getByCampaign(1).then(data => {
        setLeads(data);
      }).catch(err => {
        console.error("Error al cargar leads:", err);
      });
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No se encontró la campaña solicitada.</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Detalles de la Campaña</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h2>
        <p className="text-gray-600 mb-4">{campaign.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Fecha de inicio</h3>
            <p className="text-gray-800">{new Date(campaign.startDate).toLocaleDateString()}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Fecha de finalización</h3>
            <p className="text-gray-800">{new Date(campaign.endDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Total de contactos</h3>
            <p className="text-2xl font-bold text-blue-700">{campaign.totalLeads}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Llamadas completadas</h3>
            <p className="text-2xl font-bold text-green-700">{campaign.completedCalls}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Llamadas exitosas</h3>
            <p className="text-2xl font-bold text-purple-700">{campaign.successfulCalls}</p>
          </div>
        </div>
      </div>
      
      {/* Sección de contactos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Contactos de la Campaña</h2>
          <button 
            onClick={() => window.location.href = `/campaigns/${campaign.id}/leads/import`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Contactos
          </button>
        </div>
        
        {leads.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No hay contactos asociados a esta campaña.</p>
            <button 
              onClick={() => window.location.href = `/campaigns/${campaign.id}/leads/import`}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Importar contactos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[lead.status || 'new']
                      }`}>
                        {statusLabels[lead.status || 'new']}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => window.location.href = `/leads/${lead.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => window.location.href = `/leads/${lead.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para gestión de leads
const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Status colors y labels para los diferentes estados
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800'
  };
  
  const statusLabels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No calificado',
    converted: 'Convertido'
  };
  
  // Cargar los leads al montar el componente
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsData = await Lead.getAll();
        setLeads(leadsData);
      } catch (err) {
        console.error('Error al cargar los leads:', err);
        setError('No se pudieron cargar los leads. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  // Manejar el cambio de estado de un lead
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await Lead.update(leadId, { status: newStatus });
      // Actualizar el estado local
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
      setError('No se pudo actualizar el estado del lead.');
    }
  };
  
  // Manejar la eliminación de un lead
  const handleDelete = async (leadId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este lead?')) {
      try {
        await Lead.delete(leadId);
        setLeads(leads.filter(lead => lead.id !== leadId));
      } catch (err) {
        console.error('Error al eliminar el lead:', err);
        setError('No se pudo eliminar el lead.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Listado de Leads</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '/leads/import'}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Leads
          </button>
          <button 
            onClick={() => window.location.href = '/leads/new'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Nuevo Lead
          </button>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 text-lg mb-4">No hay leads disponibles</p>
          <button 
            onClick={() => window.location.href = '/leads/import'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Leads
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaña
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.company || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={lead.status || 'new'} 
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-sm font-medium px-2 py-1 rounded-full ${statusColors[lead.status || 'new']}`}
                    >
                      {Object.keys(statusLabels).map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {lead.campaignName || 'Sin campaña'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.location.href = `/leads/${lead.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => window.location.href = `/leads/${lead.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Componente para importar leads
const ImportLeadsPage = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Campaña Ventas Q1' },
    { id: 2, name: 'Seguimiento Clientes' }
  ]);
  
  // Manejar la selección del archivo CSV
  const handleFileChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor, seleccione un archivo CSV válido');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvData(text);
      parseCSV(text);
    };
    
    reader.readAsText(file);
  };
  
  // Analizar los datos CSV
  const parseCSV = (text) => {
    try {
      // Implementación simplificada del análisis CSV
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        const values = rows[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      }
      
      setParsedData(data);
    } catch (err) {
      console.error('Error al analizar el CSV:', err);
      setError('No se pudo analizar el archivo CSV. Verifique el formato.');
    }
  };
  
  // Manejar la importación de leads
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign) {
      setError('Por favor, seleccione una campaña');
      return;
    }
    
    if (parsedData.length === 0) {
      setError('No hay datos para importar');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Asumimos que el modelo Lead tiene un método para importar leads
      const result = await Lead.importLeads(selectedCampaign, parsedData);
      setSuccess(`Se importaron ${result.count} leads correctamente`);
      
      // Limpiar datos
      setCsvData('');
      setParsedData([]);
      document.getElementById('csv-file').value = '';
    } catch (err) {
      console.error('Error al importar leads:', err);
      setError('Ocurrió un error al importar los leads');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Importar Leads</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form onSubmit={handleImport}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="campaign">
              Campaña *
            </label>
            <select
              id="campaign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              required
            >
              <option value="">Seleccione una campaña</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Seleccione la campaña a la que desea importar los leads
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="csv-file">
              Archivo CSV *
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv, text/csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              El archivo debe contener al menos las columnas: name, email, phone
            </p>
          </div>
          
          {parsedData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Vista previa ({parsedData.length} registros)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(parsedData[0]).map(header => (
                        <th 
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                      <tr>
                        <td 
                          colSpan={Object.keys(parsedData[0]).length} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                        >
                          ... {parsedData.length - 5} más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.location.href = '/leads'}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || parsedData.length === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Importando...' : 'Importar Leads'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Formato del archivo CSV</h2>
        <p className="mb-4">El archivo CSV debe tener el siguiente formato:</p>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <code>name,email,phone,company</code><br />
          <code>Juan Pérez,juan@ejemplo.com,+123456789,Empresa ABC</code><br />
          <code>María López,maria@ejemplo.com,+987654321,Empresa XYZ</code>
        </div>
      </div>
    </div>
  );
};

// Componente para balance y saldo
const BalancePage = () => {
  const [balance, setBalance] = useState({
    currentBalance: 250.00,
    totalSpent: 750.00,
    callRate: 0.05, // $0.05 por llamada
    callMinuteRate: 0.02 // $0.02 por minuto adicional
  });
  
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2025-03-15',
      type: 'charge',
      amount: 200.00,
      description: 'Recarga de saldo',
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-03-17',
      type: 'expense',
      amount: 75.00,
      description: 'Consumo Campaña "Ventas Q1"',
      campaignId: 1,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-04-01',
      type: 'charge',
      amount: 150.00,
      description: 'Recarga de saldo',
      status: 'completed'
    },
    {
      id: 4,
      date: '2025-04-10',
      type: 'expense',
      amount: 25.00,
      description: 'Consumo Campaña "Seguimiento Clientes"',
      campaignId: 2,
      status: 'completed'
    }
  ]);
  
  const [campaignCosts, setCampaignCosts] = useState([
    {
      id: 1,
      name: 'Campaña Ventas Q1',
      calls: 208,
      totalMinutes: 785,
      cost: 75.00,
      status: 'active'
    },
    {
      id: 2,
      name: 'Seguimiento Clientes',
      calls: 89,
      totalMinutes: 267,
      cost: 25.00,
      status: 'paused'
    }
  ]);
  
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Simulación de recarga de saldo
  const handleRecharge = async (e) => {
    e.preventDefault();
    
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulamos la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(rechargeAmount);
      
      // Actualizar saldo
      setBalance(prev => ({
        ...prev,
        currentBalance: prev.currentBalance + amount
      }));
      
      // Añadir nueva transacción
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: 'charge',
        amount: amount,
        description: 'Recarga de saldo',
        status: 'completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      setSuccess(`Recarga de $${amount.toFixed(2)} realizada con éxito`);
      setRechargeAmount('');
    } catch (err) {
      console.error('Error al realizar la recarga:', err);
      setError('No se pudo completar la recarga. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Saldo</h1>
      
      {/* Resumen de saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Saldo Disponible</h2>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-blue-600">${balance.currentBalance.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 mt-2">
              Has gastado un total de ${balance.totalSpent.toFixed(2)} en llamadas
            </p>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Tarifas actuales</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Llamada:</span> ${balance.callRate.toFixed(2)} por llamada
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Minuto adicional:</span> ${balance.callMinuteRate.toFixed(2)} por minuto
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recargar Saldo</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            
            <form onSubmit={handleRecharge}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                  Monto a recargar ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="10"
                  step="10"
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Monto mínimo: $10.00
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? 'Procesando...' : 'Recargar Ahora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Historial de transacciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'charge' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'charge' ? 'Recarga' : 'Consumo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Desglose por campaña */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Consumo por Campaña</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaña
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Llamadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minutos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaignCosts.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.totalMinutes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${campaign.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente para el sistema de administración de saldo con costos inflados
const AdminBalanceSystem = () => {
  const [systemStats, setSystemStats] = useState({
    totalRealCost: 325.00,
    totalChargedAmount: 650.00,
    profits: 325.00,
    userRecharges: 1000.00,
    availableBalance: 350.00
  });
  
  const [showRealNumbers, setShowRealNumbers] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Lista de transacciones del sistema
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2025-03-15',
      userId: 101,
      userName: 'Cliente Empresa A',
      type: 'recharge',
      realAmount: 200.00,
      chargedAmount: 200.00,
      profit: 0,
      status: 'completed',
      notes: 'Recarga por transferencia bancaria'
    },
    {
      id: 2,
      date: '2025-03-17',
      userId: 101,
      userName: 'Cliente Empresa A',
      type: 'call_expense',
      campaignName: 'Campaña Ventas Q1',
      calls: 750,
      realAmount: 37.50, // Costo real por llamada ($0.05)
      chargedAmount: 75.00, // Costo inflado ($0.10)
      profit: 37.50,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-04-01',
      userId: 102,
      userName: 'Cliente Empresa B',
      type: 'recharge',
      realAmount: 150.00,
      chargedAmount: 150.00,
      profit: 0,
      status: 'completed',
      notes: 'Recarga con tarjeta de crédito'
    },
    {
      id: 4, 
      date: '2025-04-10',
      userId: 102,
      userName: 'Cliente Empresa B',
      type: 'call_expense',
      campaignName: 'Seguimiento Clientes',
      calls: 250,
      realAmount: 12.50, // Costo real ($0.05)
      chargedAmount: 25.00, // Costo inflado ($0.10)
      profit: 12.50,
      status: 'completed'
    }
  ]);
  
  // Verificar contraseña y mostrar datos reales
  const handlePasswordCheck = (e) => {
    e.preventDefault();
    // Contraseña de administrador para ver los datos reales
    if (password === 'admin123') {
      setShowRealNumbers(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };
  
  // Configuración del sistema
  const [settings, setSettings] = useState({
    inflationRate: 2.0, // Multiplicador de costos (2x)
    realCallCost: 0.05, // Costo real por llamada
    chargedCallCost: 0.10, // Costo que se cobra al cliente
    minRechargeAmount: 50.00 // Monto mínimo de recarga
  });
  
  // Actualizar la configuración
  const updateSettings = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para actualizar la configuración en la base de datos
    alert("Configuración actualizada");
  };
  
  // Añadir recarga manual
  const [rechargeData, setRechargeData] = useState({
    userId: '',
    amount: '',
    notes: ''
  });
  
  const handleRechargeChange = (e) => {
    const { name, value } = e.target;
    setRechargeData({
      ...rechargeData,
      [name]: value
    });
  };
  
  const handleRechargeSubmit = (e) => {
    e.preventDefault();
    
    if (!rechargeData.userId || !rechargeData.amount || isNaN(rechargeData.amount)) {
      alert("Por favor, complete todos los campos correctamente");
      return;
    }
    
    const amount = parseFloat(rechargeData.amount);
    
    // Nueva transacción de recarga
    const newTransaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      userId: parseInt(rechargeData.userId),
      userName: `Cliente ID: ${rechargeData.userId}`,
      type: 'recharge',
      realAmount: amount,
      chargedAmount: amount, // No hay inflación en las recargas
      profit: 0,
      status: 'completed',
      notes: rechargeData.notes || 'Recarga manual'
    };
    
    // Actualizar transacciones y estadísticas
    setTransactions([newTransaction, ...transactions]);
    setSystemStats({
      ...systemStats,
      userRecharges: systemStats.userRecharges + amount,
      availableBalance: systemStats.availableBalance + amount
    });
    
    // Limpiar formulario
    setRechargeData({
      userId: '',
      amount: '',
      notes: ''
    });
    
    alert(`Recarga de $${amount.toFixed(2)} realizada con éxito para el usuario ${rechargeData.userId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Panel de Administración de Saldo</h1>
      
      {/* Auth para mostrar datos reales */}
      {!showRealNumbers && (
       
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acceso a datos reales</h2>
          <form onSubmit={handlePasswordCheck} className="flex space-x-4">
            <div className="flex-grow">
              <input
                type="password"
                placeholder="Ingrese contraseña de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Acceder
            </button>
          </form>
        </div>
      )}
      
      {/* Resumen financiero */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen Financiero</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Recargas</p>
              <p className="text-2xl font-bold text-blue-600">${systemStats.userRecharges.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Saldo Disponible</p>
              <p className="text-2xl font-bold text-green-600">${systemStats.availableBalance.toFixed(2)}</p>
            </div>
            
            {showRealNumbers && (
              <>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Costo Real Acumulado</p>
                  <p className="text-2xl font-bold text-indigo-600">${systemStats.totalRealCost.toFixed(2)}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Ganancias</p>
                  <p className="text-2xl font-bold text-purple-600">${systemStats.profits.toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Configuración del sistema */}
      {showRealNumbers && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Costos</h2>
            
            <form onSubmit={updateSettings}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo real por llamada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.realCallCost}
                    onChange={(e) => setSettings({...settings, realCallCost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo cobrado por llamada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.chargedCallCost}
                    onChange={(e) => setSettings({...settings, chargedCallCost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Multiplicador de costo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={settings.inflationRate}
                    onChange={(e) => setSettings({...settings, inflationRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto mínimo de recarga ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={settings.minRechargeAmount}
                    onChange={(e) => setSettings({...settings, minRechargeAmount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Añadir recarga manual */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Recarga Manual</h2>
          
          <form onSubmit={handleRechargeSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Usuario
                </label>
                <input
                  type="text"
                  name="userId"
                  value={rechargeData.userId}
                  onChange={handleRechargeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min={settings.minRechargeAmount}
                  value={rechargeData.amount}
                  onChange={handleRechargeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <input
                  type="text"
                  name="notes"
                  value={rechargeData.notes}
                  onChange={handleRechargeChange}
                  placeholder="Ej: Transferencia #12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Registrar Recarga
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Historial de transacciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Cobrado
                </th>
                {showRealNumbers && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ganancia
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'recharge' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'recharge' ? 'Recarga' : 'Consumo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.chargedAmount.toFixed(2)}
                  </td>
                  {showRealNumbers && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.realAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.profit.toFixed(2)}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type === 'recharge' 
                      ? transaction.notes 
                      : `${transaction.campaignName} (${transaction.calls} llamadas)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente para reportes
const ReportsPage = () => (
  <div>
    <p>Página en desarrollo</p>
  </div>
);

// Componente principal App
function App() {
  const { isAuthenticated, loading } = useAuth();
  // Para propósitos de demostración, definimos isAdmin manualmente
  const isAdmin = true; // En un caso real, esto vendría de tu sistema de autenticación
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }


  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/campaigns" element={
          isAuthenticated ? (
            <Layout>
              <CampaignsPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/campaigns/new" element={
          isAuthenticated ? (
            <Layout>
              <NewCampaignPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/campaigns/:id" element={
          isAuthenticated ? (
            <Layout>
              <CampaignDetail />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/leads" element={
          isAuthenticated ? (
            <Layout>
              <LeadsPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/leads/import" element={
          isAuthenticated ? (
            <Layout>
              <ImportLeadsPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/balance" element={
          isAuthenticated ? (
            <Layout>
              <BalancePage />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/admin/balance" element={
          isAuthenticated && isAdmin ? (
            <Layout>
              <AdminBalanceSystem />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


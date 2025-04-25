// src/components/ImprovedLayout.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ImprovedLayout = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Obtener título de la página actual
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Panel de Control';
    if (path.includes('/campaigns')) return 'Gestión de Campañas';
    if (path.includes('/leads')) return 'Gestión de Contactos';
    if (path.includes('/balance')) return 'Gestión de Saldo';
    if (path.includes('/admin')) return 'Administración';
    
    return 'Call Campaign Manager';
  };
  
  // Verificar si una ruta está activa
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Toggle del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="layout-container">
      {/* Navbar superior */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <button 
            className="navbar-toggler border-0 me-2" 
            type="button" 
            onClick={toggleSidebar}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <Link className="navbar-brand" to="/dashboard">
            Call Campaign Manager
          </Link>
          
          <div className="ms-auto d-flex align-items-center">
            <div className="dropdown">
              <button 
                className="btn btn-dark dropdown-toggle d-flex align-items-center" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div className="user-avatar me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '32px', height: '32px' }}>
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <span className="d-none d-md-block">{currentUser?.name || 'Usuario'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <div className="dropdown-item-text">
                    <div className="fw-bold">{currentUser?.name}</div>
                    <div className="small text-muted">{currentUser?.email}</div>
                    <div className="small text-muted">
                      {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="fas fa-user me-2"></i> Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="fas fa-cog me-2"></i> Configuración
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className={`sidebar bg-light ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Menú Principal</h5>
              <button 
                className="btn btn-sm btn-light d-lg-none" 
                onClick={toggleSidebar}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <ul className="nav nav-pills flex-column">
              <li className="nav-item mb-1">
                <Link 
                  className={`nav-link ${isActive('/dashboard') ? 'active bg-primary' : ''}`} 
                  to="/dashboard"
                >
                  <i className="fas fa-tachometer-alt me-2"></i> Dashboard
                </Link>
              </li>
              
              <li className="nav-item mb-1">
                <Link 
                  className={`nav-link ${isActive('/campaigns') ? 'active bg-primary' : ''}`} 
                  to="/campaigns"
                >
                  <i className="fas fa-bullhorn me-2"></i> Campañas
                </Link>
              </li>
              
              <li className="nav-item mb-1">
                <Link 
                  className={`nav-link ${isActive('/leads') ? 'active bg-primary' : ''}`} 
                  to="/leads"
                >
                  <i className="fas fa-users me-2"></i> Contactos
                </Link>
              </li>
              
              <li className="nav-item mb-1">
                <Link 
                  className={`nav-link ${isActive('/balance') && !isActive('/admin/balance') ? 'active bg-primary' : ''}`} 
                  to="/balance"
                >
                  <i className="fas fa-wallet me-2"></i> Saldo
                </Link>
              </li>
              
              {/* Sección solo para administradores */}
              {isAdmin() && (
                <>
                  <li className="nav-item mt-3 mb-2">
                    <h6 className="sidebar-heading px-3 text-muted text-uppercase">
                      <span>Administración</span>
                    </h6>
                  </li>
                  
                  <li className="nav-item mb-1">
                    <Link 
                      className={`nav-link ${isActive('/admin/balance') ? 'active bg-primary' : ''}`} 
                      to="/admin/balance"
                    >
                      <i className="fas fa-money-bill-wave me-2"></i> Admin Saldo
                    </Link>
                  </li>
                  
                  <li className="nav-item mb-1">
                    <Link 
                      className={`nav-link ${isActive('/admin/users') ? 'active bg-primary' : ''}`} 
                      to="/admin/users"
                    >
                      <i className="fas fa-user-cog me-2"></i> Usuarios
                    </Link>
                  </li>
                  
                  <li className="nav-item mb-1">
                    <Link 
                      className={`nav-link ${isActive('/admin/reports') ? 'active bg-primary' : ''}`} 
                      to="/admin/reports"
                    >
                      <i className="fas fa-chart-line me-2"></i> Reportes
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="main-content flex-grow-1 p-4">
          <div className="content-header mb-4">
            <div className="row">
              <div className="col">
                <h1 className="h2">{getPageTitle()}</h1>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Inicio</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      {getPageTitle()}
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
          
          {/* Contenido de la página */}
          <div className="content-body">
            {children}
          </div>
        </div>
      </div>
      
      {/* Estilo para sidebar responsive */}
      <style jsx="true">{`
        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .sidebar {
          width: 250px;
          transition: all 0.3s;
          z-index: 1000;
        }
        
        .sidebar.closed {
          margin-left: -250px;
        }
        
        .main-content {
          min-height: calc(100vh - 56px);
          transition: all 0.3s;
        }
        
        @media (max-width: 991.98px) {
          .sidebar {
            position: fixed;
            height: 100%;
            overflow-y: auto;
          }
          
          .sidebar.closed {
            margin-left: -250px;
          }
          
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ImprovedLayout;
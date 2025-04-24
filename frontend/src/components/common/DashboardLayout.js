import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Estilos inline temporales (después usaremos Material UI)
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px 0',
  },
  sidebarHeader: {
    padding: '0 20px 20px',
    borderBottom: '1px solid #334155',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
  },
  nav: {
    marginTop: '20px',
  },
  navItem: {
    display: 'block',
    padding: '10px 20px',
    color: '#94a3b8',
    textDecoration: 'none',
    marginBottom: '5px',
  },
  activeNavItem: {
    backgroundColor: '#334155',
    color: 'white',
    borderRight: '3px solid #3b82f6',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    fontWeight: 'bold',
  },
  mainContent: {
    padding: '30px',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '15px',
  },
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Definir enlaces de navegación
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/campaigns', label: 'Campañas' },
    { path: '/leads', label: 'Leads' },
    { path: '/reports', label: 'Reportes' },
    { path: '/balance', label: 'Saldo' },
  ];
  
  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Link to="/dashboard" style={styles.logo}>
            CallCampaign
          </Link>
        </div>
        
        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === link.path ? styles.activeNavItem : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <h2>{navLinks.find(link => link.path === location.pathname)?.label || 'Dashboard'}</h2>
          
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
            <span>{user?.name || 'Usuario'}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main style={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import useAuth from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDetails from './pages/admin/UserDetails';
import CreateUser from './pages/admin/CreateUser';

// Páginas regulares
import SettingsPage from './pages/SettingsPage';
import CampaignsPage from './pages/CampaignsPage';
import LeadsPage from './pages/LeadsPage';
import BalancePage from './pages/BalancePage';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import EditCampaignPage from './pages/campaigns/EditCampaignPage';
import ImportLeadsPage from './pages/campaigns/ImportLeadsPage';

// Services
import { Lead } from './services/mockData';

/**
 * Componente ProtectedRoute para rutas que requieren autenticación
 */
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  
  // Verificar si está autenticado
  if (!auth.isAuthenticated()) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * Componente AdminRoute para rutas que requieren rol de administrador
 */
const AdminRoute = ({ children }) => {
  const auth = useAuth();
  
  // Verificar si está autenticado y es admin
  if (!auth.isAuthenticated() || !auth.isAdmin) {
    // Redirigir a dashboard si no es admin
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componentes temporales para completar las rutas
// Estos se reemplazarán por los componentes reales
const NewCampaignPage = () => <div className="p-4"><h1>Nueva Campaña</h1><p>Formulario de creación...</p></div>;
// El componente LeadsPage ahora se importa desde su propio archivo
// El componente BalancePage ahora se importa desde su propio archivo
// El componente SettingsPage ahora se importa desde su propio archivo
const AdminBalancePage = () => <div className="p-4"><h1>Administración de Saldo</h1><p>Cargando panel administrativo...</p></div>;

/**
 * Componente principal de la aplicación
 */
const App = () => {
  const auth = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={
          auth.isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
        } />
        
        {/* Rutas protegidas dentro del Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Dashboard como ruta principal */}
          <Route index element={<Dashboard />} />
          
          {/* Rutas para campañas */}
          <Route path="campaigns">
            <Route index element={<CampaignsPage />} />
            <Route path=":id" element={<CampaignDetail />} />
            <Route path=":id/edit" element={<EditCampaignPage />} />
            <Route path=":id/import-leads" element={<ImportLeadsPage />} />
            <Route path="new" element={<NewCampaignPage />} />
          </Route>
          
          {/* Rutas para leads/contactos */}
          <Route path="leads">
            <Route index element={<LeadsPage />} />
            <Route path="import" element={<ImportLeadsPage />} />
          </Route>
          
          {/* Rutas para balance/saldo */}
          <Route path="balance" element={<BalancePage />} />
          
          {/* Rutas para administración (solo admin) */}
          <Route path="settings" element={
            <AdminRoute>
              <SettingsPage />
            </AdminRoute>
          } />
          
          <Route path="admin/balance" element={
            <AdminRoute>
              <AdminBalancePage />
            </AdminRoute>
          } />
          
          {/* Admin User Management Routes */}
          <Route path="admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/users/create" element={
            <AdminRoute>
              <CreateUser />
            </AdminRoute>
          } />
          <Route path="admin/users/:userId" element={
            <AdminRoute>
              <UserDetails />
            </AdminRoute>
          } />
        </Route>
        
        {/* Ruta por defecto: redirige al dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

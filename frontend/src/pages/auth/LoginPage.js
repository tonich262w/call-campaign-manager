// src/pages/auth/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      await login(email, password);
      // La redirección se maneja en el useEffect
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div className="card shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h2>Call Campaign Manager</h2>
          <p className="mb-0">Acceso al Sistema</p>
        </div>
        
        <div className="card-body p-4">
          {errorMsg && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i> {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <div className="mb-3 text-end">
              <a href="#!" className="text-decoration-none">¿Olvidaste tu contraseña?</a>
            </div>
            
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-muted small">Credenciales de prueba:</p>
            <p className="text-muted small mb-0">Admin: admin@example.com / password123</p>
            <p className="text-muted small">Usuario: user@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
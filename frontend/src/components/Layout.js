// src/components/Layout.js

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaPhoneAlt, FaAddressBook, FaWallet, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para determinar la clase activa de los enlaces
  const getLinkClass = ({ isActive }) => {
    return isActive
      ? "bg-blue-800 text-white flex items-center px-4 py-2 rounded-md mb-1"
      : "text-gray-300 hover:bg-blue-700 hover:text-white flex items-center px-4 py-2 rounded-md mb-1";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para móviles */}
      <div className="md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 rounded-md bg-blue-600 text-white"
        >
          <FaBars className="h-6 w-6" />
        </button>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar móvil */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center p-4 border-b border-blue-800">
            <h2 className="text-xl font-bold text-white">Call Campaign</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white p-2"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {renderNavLinks()}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-blue-900">
          <div className="flex items-center h-16 px-4 bg-blue-800">
            <h2 className="text-xl font-bold text-white">Call Campaign</h2>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4">
            <nav className="flex-1 space-y-1">
              {renderNavLinks()}
            </nav>
            <div className="mt-auto pt-4 border-t border-blue-800">
              <div className="flex items-center px-4 py-2 text-gray-300">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 w-full text-gray-300 hover:bg-blue-700 hover:text-white flex items-center px-4 py-2 rounded-md"
              >
                <FaSignOutAlt className="mr-3 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow">
          <div className="px-4 py-4 sm:px-6 md:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Call Campaign Manager
            </h1>
            <div className="hidden md:flex items-center">
              {user?.role === 'admin' && (
                <NavLink to="/settings" className="text-gray-500 hover:text-gray-700 mr-4">
                  <FaCog className="h-5 w-5" />
                </NavLink>
              )}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="hidden md:inline-block text-sm text-gray-700 mr-2">
                    {user?.name || 'Usuario'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );

  // Función auxiliar para renderizar los enlaces de navegación
  function renderNavLinks() {
    return (
      <>
        <NavLink to="/" className={getLinkClass} end>
          <FaHome className="mr-3 h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink to="/campaigns" className={getLinkClass}>
          <FaPhoneAlt className="mr-3 h-4 w-4" />
          Campañas
        </NavLink>
        <NavLink to="/leads" className={getLinkClass}>
          <FaAddressBook className="mr-3 h-4 w-4" />
          Contactos
        </NavLink>
        <NavLink to="/balance" className={getLinkClass}>
          <FaWallet className="mr-3 h-4 w-4" />
          Saldo
        </NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin/dashboard" className={getLinkClass}>
              <FaCog className="mr-3 h-4 w-4" />
              Panel Admin
            </NavLink>
            <NavLink to="/settings" className={getLinkClass}>
              <FaCog className="mr-3 h-4 w-4" />
              Configuración
            </NavLink>
          </>
        )}
      </>
    );
  }
};

export default Layout;
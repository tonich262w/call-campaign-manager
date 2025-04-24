import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Container, Grid } from '@mui/material';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Campañas', path: '/campaigns' },
    { name: 'Contactos', path: '/contacts' },
    { name: 'Recargar', path: '/recharge' },
    { name: 'Configuración', path: '/settings' },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={sidebarOpen ? "fixed inset-0 z-40 lg:hidden block" : "fixed inset-0 z-40 lg:hidden hidden"} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        
        <div className="relative flex flex-col flex-1 w-full max-w-xs bg-indigo-700">
          <div className="absolute top-0 right-0 pt-2 -mr-12">
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
            </div>
            <nav className="px-2 mt-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={location.pathname === item.path
                    ? "group flex items-center px-2 py-2 text-base font-medium rounded-md bg-indigo-800 text-white"
                    : "group flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
                  }
                >
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

            <div className="flex items-center">
              <div className="ml-3">

                <button className="text-sm font-medium text-indigo-200 hover:text-white">
                  Cerrar sesión
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={location.pathname === item.path
                      ? "group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-800 text-white"
                      : "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
                    }
                  >
                  </Link>
                ))}
              </nav>
      </div>
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-600 sm:px-6 lg:px-8">
            <h1 className="text-lg font-medium text-white">Call Campaign Manager</h1>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
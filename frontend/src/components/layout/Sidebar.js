import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Campañas', path: '/dashboard/campaigns', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { name: 'Leads', path: '/dashboard/leads', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Perfil', path: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  return (
    <div className="flex flex-col h-screen bg-white border-r">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-xl font-bold text-blue-600">CRM App</h1>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-grow p-4 overflow-auto">
        <div className="flex flex-col mt-4">
          {navItems.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 mt-2 text-gray-600 transition-colors duration-200 transform rounded-lg
                 ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`
              }
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              <span className="mx-4 font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="flex items-center p-4 border-t">
        <div className="flex items-center">
          <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{currentUser?.email}</p>
            <p className="text-xs text-gray-500">Usuario</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
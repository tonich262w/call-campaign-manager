import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">Mi Aplicación</h1>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg">
          <nav className="p-4 space-y-4">
            <a href="/dashboard" className="block p-2 rounded hover:bg-gray-200">
              Dashboard
            </a>
            <a href="/campaigns" className="block p-2 rounded hover:bg-gray-200">
              Campañas
            </a>
            <a href="/leads" className="block p-2 rounded hover:bg-gray-200">
              Leads
            </a>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="flex-grow p-6 bg-background">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white p-4 text-center">
        © 2025 Mi Aplicación
      </footer>
    </div>
  );
};

export default Layout;
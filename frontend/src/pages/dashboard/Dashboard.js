import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Panel de Control</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded shadow">
          <h3 className="text-lg font-bold">Campañas Activas</h3>
          <p className="text-4xl font-bold text-primary">12</p>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <h3 className="text-lg font-bold">Llamadas Completadas</h3>
          <p className="text-4xl font-bold text-secondary">350</p>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <h3 className="text-lg font-bold">Nuevos Leads</h3>
          <p className="text-4xl font-bold text-primary">87</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
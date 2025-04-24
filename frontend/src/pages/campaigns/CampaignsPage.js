import React, { useState } from 'react';

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
    },
  ]);

  const handlePauseCampaign = (id) => {
    setCampaigns(campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, status: 'paused' } : campaign
    ));
  };

  const handleResumeCampaign = (id) => {
    setCampaigns(campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, status: 'active' } : campaign
    ));
  };

  return (
    <div className="campaigns-page">
      <div className="page-actions">
        <button
          className="primary-button"
          onClick={() => (window.location.href = '/campaigns/new')}
        >
          Nueva Campaña
        </button>
      </div>

      <div className="campaigns-list">
        {campaigns.map((campaign) => (
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
                  {Math.round(
                    (campaign.completedCalls / campaign.totalLeads) * 100
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="campaign-actions">
              <button
                className="action-button"
                onClick={() =>
                  (window.location.href = `/campaigns/${campaign.id}`)
                }
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

export default CampaignsPage;
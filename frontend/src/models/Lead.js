const sampleLeads = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+1234567890',
    company: 'TechCorp',
    status: 'new',
    campaignId: 1,
    campaignName: 'Campaña Ventas Q1',
    createdAt: new Date('2025-01-20')
  },
  {
    id: 2,
    name: 'María López',
    email: 'maria.lopez@ejemplo.com',
    phone: '+0987654321',
    company: 'InnovaSA',
    status: 'contacted',
    campaignId: 1,
    campaignName: 'Campaña Ventas Q1',
    createdAt: new Date('2025-01-21')
  },
  {
    id: 3,
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@ejemplo.com',
    phone: '+1122334455',
    company: 'GlobalTech',
    status: 'qualified',
    campaignId: 2,
    campaignName: 'Seguimiento Clientes',
    createdAt: new Date('2025-01-22')
  }
];

class Lead {
  static async getAll() {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleLeads);
      }, 500);
    });
  }

  static async getByCampaign(campaignId) {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredLeads = sampleLeads.filter(lead => 
          lead.campaignId === Number(campaignId)
        );
        resolve(filteredLeads);
      }, 500);
    });
  }

  static async getById(id) {
    // Simulamos una llamada a API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lead = sampleLeads.find(lead => lead.id === Number(id));
        if (lead) {
          resolve(lead);
        } else {
          reject(new Error('Lead no encontrado'));
        }
      }, 500);
    });
  }

  static async create(leadData) {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          id: sampleLeads.length + 1,
          ...leadData,
          createdAt: new Date()
        };
        sampleLeads.push(newLead);
        resolve(newLead);
      }, 500);
    });
  }

  static async update(id, leadData) {
    // Simulamos una llamada a API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = sampleLeads.findIndex(lead => lead.id === Number(id));
        if (index !== -1) {
          sampleLeads[index] = {
            ...sampleLeads[index],
            ...leadData,
            updatedAt: new Date()
          };
          resolve(sampleLeads[index]);
        } else {
          reject(new Error('Lead no encontrado'));
        }
      }, 500);
    });
  }

  static async delete(id) {
    // Simulamos una llamada a API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = sampleLeads.findIndex(lead => lead.id === Number(id));
        if (index !== -1) {
          sampleLeads.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Lead no encontrado'));
        }
      }, 500);
    });
  }

  static async importLeads(campaignId, leads) {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const campaignName = campaignId === 1 ? 'Campaña Ventas Q1' : 'Seguimiento Clientes';
        
        const newLeads = leads.map((lead, index) => ({
          id: sampleLeads.length + index + 1,
          ...lead,
          campaignId: Number(campaignId),
          campaignName,
          status: 'new',
          createdAt: new Date()
        }));
        
        sampleLeads.push(...newLeads);
        resolve({ success: true, count: newLeads.length });
      }, 1000);
    });
  }
}

export default Lead;

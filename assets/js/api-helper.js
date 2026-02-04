// API Helper - Cliente HTTP para MongoDB
const API_BASE = window.location.origin;

const api = {
  // Buscar todos os dados do site
  async getSiteData() {
    try {
      const response = await fetch(`${API_BASE}/api/site-data`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return null;
    }
  },

  // Atualizar todos os dados do site
  async updateSiteData(data) {
    try {
      const response = await fetch(`${API_BASE}/api/site-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao salvar dados');
      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  }
};

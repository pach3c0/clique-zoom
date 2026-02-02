// API Helper - Substituir localStorage por chamadas HTTP ao MongoDB
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
  },

  // Adicionar item ao portfolio
  async addPortfolioItem(item) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Erro ao adicionar item');
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  },

  // Atualizar item do portfolio
  async updatePortfolioItem(index, item) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Erro ao atualizar item');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  },

  // Remover item do portfolio
  async deletePortfolioItem(index) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/${index}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao remover item');
      return await response.json();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  }
};

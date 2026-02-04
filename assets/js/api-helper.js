// API Helper - Cliente HTTP
const API_BASE = window.location.origin;

const api = {
  // ========== AUTENTICAÇÃO ==========
  
  async login(password) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error('Login falhou');
    return await response.json();
  },

  async verifyToken(token) {
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // ========== DADOS DO SITE ==========

  async getSiteData() {
    try {
      const response = await fetch(`${API_BASE}/api/site-data`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Erro ao buscar dados');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return null;
    }
  },

  async updateSiteData(data, token) {
    try {
      const response = await fetch(`${API_BASE}/api/site-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao salvar dados');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      throw error;
    }
  },

  // ========== PORTFOLIO ==========

  async addPortfolioItem(item, token) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Erro ao adicionar item');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao adicionar item:', error);
      throw error;
    }
  },

  async updatePortfolioItem(index, item, token) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Erro ao atualizar item');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao atualizar item:', error);
      throw error;
    }
  },

  async deletePortfolioItem(index, token) {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao deletar item');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao deletar item:', error);
      throw error;
    }
  },

  // ========== CONFIG DO SITE ==========

  async getSiteConfig() {
    try {
      const response = await fetch(`${API_BASE}/api/site-config`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Erro ao buscar config');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar config:', error);
      return null;
    }
  },

  async updateSiteConfig(config, token) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/site-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Erro ao salvar config');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao salvar config:', error);
      throw error;
    }
  },

  // ========== NEWSLETTER ==========

  async subscribeNewsletter(email) {
    try {
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error('Erro ao inscrever');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao inscrever newsletter:', error);
      throw error;
    }
  },

  // ========== UPLOAD DE ARQUIVOS ==========

  async uploadImage(file, token) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Erro ao fazer upload');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
  }
};

const express = require('express');
const router = express.Router();
const SiteData = require('../models/SiteData');

// GET - Obter todos os dados do site
router.get('/site-data', async (req, res) => {
  try {
    const data = await SiteData.getSiteData();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do site' });
  }
});

// PUT - Atualizar dados do site
router.put('/site-data', async (req, res) => {
  try {
    const data = await SiteData.updateSiteData(req.body);
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do site' });
  }
});

// POST - Adicionar item ao portfolio
router.post('/portfolio', async (req, res) => {
  try {
    const data = await SiteData.getSiteData();
    data.portfolio.push(req.body);
    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Erro ao adicionar ao portfolio:', error);
    res.status(500).json({ error: 'Erro ao adicionar item ao portfolio' });
  }
});

// PUT - Atualizar item do portfolio
router.put('/portfolio/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = await SiteData.getSiteData();
    
    if (index < 0 || index >= data.portfolio.length) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    data.portfolio[index] = { ...data.portfolio[index].toObject(), ...req.body };
    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar portfolio:', error);
    res.status(500).json({ error: 'Erro ao atualizar item do portfolio' });
  }
});

// DELETE - Remover item do portfolio
router.delete('/portfolio/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = await SiteData.getSiteData();
    
    if (index < 0 || index >= data.portfolio.length) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    data.portfolio.splice(index, 1);
    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Erro ao remover do portfolio:', error);
    res.status(500).json({ error: 'Erro ao remover item do portfolio' });
  }
});

module.exports = router;

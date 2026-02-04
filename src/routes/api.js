const express = require('express');
const router = express.Router();
const dataHelper = require('../helpers/data-helper');
const mongoose = require('mongoose');

// GET - Teste de conexão MongoDB
router.get('/test-connection', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState;
    const states = {
      0: 'desconectado',
      1: 'conectado',
      2: 'conectando',
      3: 'desconectando'
    };
    
    res.json({
      status: 'ok',
      mongodb: {
        readyState: mongoStatus,
        readyStateText: states[mongoStatus],
        connected: mongoStatus === 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET - Diagnóstico completo
router.get('/diagnostico', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState;
    const states = {
      0: 'desconectado',
      1: 'conectado',
      2: 'conectando',
      3: 'desconectando'
    };
    
    let lastData = null;
    let dataFetchOk = false;
    
    try {
      lastData = await dataHelper.getSiteData();
      dataFetchOk = true;
    } catch (e) {
      // erro ao buscar dados
    }
    
    res.json({
      status: 'ok',
      mongo: {
        readyState: mongoStatus,
        readyStateText: states[mongoStatus],
        connected: mongoStatus === 1
      },
      dataFetch: {
        ok: dataFetchOk,
        lastStudioWhatsapp: lastData?.studio?.whatsapp
      },
      environment: {
        mongodbUri: process.env.MONGODB_URI ? 'configurado' : 'não configurado',
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET - Teste de criação de dados
router.get('/test-create', async (req, res) => {
  try {
    const result = await dataHelper.updateSiteData({
      hero: {
        title: 'Teste de Conexão',
        subtitle: 'Este é um teste de conexão com MongoDB'
      }
    });
    
    res.json({
      status: 'ok',
      message: 'Dados salvos com sucesso',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// GET - Obter todos os dados do site
router.get('/site-data', async (req, res) => {
  try {
    const data = await dataHelper.getSiteData();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do site' });
  }
});

// PUT - Atualizar dados do site
router.put('/site-data', async (req, res) => {
  try {
    console.log('📥 Recebido PUT /site-data com body:', {
      heroTitle: req.body.hero?.title,
      studioTitle: req.body.studio?.title,
      studioWhatsapp: req.body.studio?.whatsapp
    });
    const data = await dataHelper.updateSiteData(req.body);
    console.log('📤 Resposta com dados atualizados:', {
      studioWhatsapp: data.studio?.whatsapp
    });
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do site' });
  }
  }
});

// POST - Adicionar item ao portfolio
router.post('/portfolio', async (req, res) => {
  try {
    const data = await dataHelper.getSiteData();
    data.portfolio.push(req.body);
    await dataHelper.updateSiteData(data);
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
    const data = await dataHelper.getSiteData();
    
    if (index < 0 || index >= data.portfolio.length) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    data.portfolio[index] = { ...data.portfolio[index], ...req.body };
    await dataHelper.updateSiteData(data);
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
    const data = await dataHelper.getSiteData();
    
    if (index < 0 || index >= data.portfolio.length) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    data.portfolio.splice(index, 1);
    await dataHelper.updateSiteData(data);
    res.json(data);
  } catch (error) {
    console.error('Erro ao remover do portfolio:', error);
    res.status(500).json({ error: 'Erro ao remover item do portfolio' });
  }
});

module.exports = router;

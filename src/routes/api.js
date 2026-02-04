const express = require('express');
const router = express.Router();
const dataHelper = require('../helpers/data-helper');
const mongoose = require('mongoose');
const Newsletter = require('../models/Newsletter');

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
    // SEM cache para debug - forçar sempre pegar dados frescos
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    console.log('📥 GET /api/site-data');
    const data = await dataHelper.getSiteData();
    console.log('📤 Respondendo com:', {
      hasHero: !!data.hero,
      hasFooter: !!data.footer,
      footerQuickLinks: data.footer?.quickLinks?.length || 0
    });
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

// ========== NEWSLETTER ==========

// POST - Inscrever email na newsletter
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se já está inscrito
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      if (existing.active) {
        return res.status(200).json({ 
          message: 'Email já está inscrito',
          alreadySubscribed: true 
        });
      } else {
        // Reativar inscrição
        existing.active = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.status(200).json({ 
          message: 'Inscrição reativada com sucesso!',
          reactivated: true 
        });
      }
    }

    // Nova inscrição
    const subscription = new Newsletter({ email: email.toLowerCase() });
    await subscription.save();
    
    console.log('✅ Nova inscrição na newsletter:', email);
    
    res.status(201).json({ 
      message: 'Inscrição realizada com sucesso!',
      success: true 
    });
  } catch (error) {
    console.error('Erro ao inscrever na newsletter:', error);
    
    if (error.code === 11000) {
      return res.status(200).json({ 
        message: 'Email já está inscrito',
        alreadySubscribed: true 
      });
    }
    
    res.status(500).json({ error: 'Erro ao processar inscrição' });
  }
});

// GET - Listar emails da newsletter (para admin)
router.get('/newsletter', async (req, res) => {
  try {
    const { active = 'true', page = 1, limit = 50 } = req.query;
    
    const query = active === 'all' ? {} : { active: active === 'true' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const total = await Newsletter.countDocuments(query);
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('email subscribedAt active');
    
    res.json({
      subscribers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar newsletter:', error);
    res.status(500).json({ error: 'Erro ao listar inscrições' });
  }
});

// DELETE - Cancelar inscrição
router.delete('/newsletter/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }
    
    subscription.active = false;
    await subscription.save();
    
    res.json({ message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar newsletter:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição' });
  }
});

module.exports = router;

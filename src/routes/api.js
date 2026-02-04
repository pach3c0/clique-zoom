const express = require('express');
const router = express.Router();
const dataHelper = require('../helpers/data-helper');
const authHelper = require('../helpers/auth-helper');
const { verifyToken } = require('../middleware/auth');
const Newsletter = require('../models/Newsletter');

// ========== AUTENTICAÇÃO ==========

// POST - Login (obter JWT token)
router.post('/auth/login', async (req, res) => {
  console.log('🔓 POST /auth/login recebido');
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    const result = await authHelper.login(password);

    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }

    res.json({
      success: true,
      token: result.token,
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST - Verificar token (para validar no frontend)
router.post('/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const result = authHelper.verifyToken(token);

    res.json({ valid: result.valid });
  } catch (error) {
    res.status(401).json({ valid: false });
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

// PUT - Atualizar dados do site (PROTEGIDO)
router.put('/site-data', verifyToken, async (req, res) => {
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

// POST - Adicionar item ao portfolio (PROTEGIDO)
router.post('/portfolio', verifyToken, async (req, res) => {
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

// PUT - Atualizar item do portfolio (PROTEGIDO)
router.put('/portfolio/:index', verifyToken, async (req, res) => {
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

// DELETE - Remover item do portfolio (PROTEGIDO)
router.delete('/portfolio/:index', verifyToken, async (req, res) => {
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

// GET - Listar emails da newsletter (para admin) (PROTEGIDO)
router.get('/newsletter', verifyToken, async (req, res) => {
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

// DELETE - Cancelar inscrição (PROTEGIDO)
router.delete('/newsletter/:email', verifyToken, async (req, res) => {
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

// ========== UPLOAD (PROTEGIDO) ==========

router.post('/admin/upload', verifyToken, async (req, res) => {
  // Este endpoint é protegido - só admin pode fazer upload
  // O middleware verifyToken vai validar o token antes de chegar aqui
  try {
    // Lógica de upload aqui
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro no upload' });
  }
});

module.exports = router;


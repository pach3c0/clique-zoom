const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const dataHelper = require('../helpers/data-helper');
const authHelper = require('../helpers/auth-helper');
const { verifyToken } = require('../middleware/auth');
const Newsletter = require('../models/Newsletter');

const rootDir = path.join(__dirname, '..', '..');

// Configurar Cloudinary
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configuração do Multer
const allowedImageTypes = new Set(['image/jpeg', 'image/png']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(rootDir, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/\s+/g, '-');
    const targetPath = path.join(rootDir, 'uploads', safeName);
    if (fs.existsSync(targetPath)) {
      // Em vez de erro, vamos gerar um nome de arquivo único
      const timestamp = Date.now();
      const newName = `${timestamp}-${safeName}`;
      return cb(null, newName);
    }
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});


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

// O middleware `verifyToken` já protege esta rota
router.post('/admin/upload', verifyToken, (req, res) => {
  const useCloudinary = process.env.NODE_ENV === 'production' && isCloudinaryConfigured;
  const uploader = useCloudinary ? uploadMemory.single('image') : upload.single('image');

  uploader(req, res, async (err) => {
    if (err) {
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'Apenas imagens JPG ou PNG são permitidas' });
      }
      if (err.message === 'FILE_EXISTS') {
        return res.status(409).json({ error: 'Já existe uma imagem com esse nome' });
      }
      return res.status(500).json({ error: 'Erro durante o upload' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    if (useCloudinary) {
      try {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'cliquezoom',
          transformation: [{ quality: "auto:good" }],
        });
        return res.json({
          success: true,
          filename: result.original_filename,
          url: result.secure_url
        });
      } catch (uploadError) {
        console.error('Erro Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Erro ao enviar imagem para Cloudinary' });
      }
    } else {
      res.json({
        success: true,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
      });
    }
  });
});


module.exports = router;


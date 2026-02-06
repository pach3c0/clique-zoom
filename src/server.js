const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const SiteData = require('./models/SiteData');
const Newsletter = require('./models/Newsletter');
const Session = require('./models/Session');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/cliente', express.static(path.join(__dirname, '../cliente')));

// Rota para Galeria do Cliente (SPA)
app.get('/galeria/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../cliente/index.html'));
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cliquezoom';

let isConnected = false;

const connectWithRetry = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2
    });
    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
  } catch (err) {
    console.error('❌ Erro na conexão MongoDB:', err.message);
    isConnected = false;
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(connectWithRetry, 5000);
    }
  }
};

connectWithRetry();

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro de conexão MongoDB:', err.message);
});

app.get('/api/health', async (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  
  try {
    const mongoTest = readyState === 1 ? await SiteData.findOne().lean() : null;
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      mongodb: {
        state: readyState,
        stateText: states[readyState] || 'desconhecido',
        hasData: !!mongoTest
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      mongodb: {
        state: readyState,
        stateText: states[readyState] || 'desconhecido'
      }
    });
  }
});

// ========== CLOUDINARY & MULTER ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadMemory = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 50
  }
});
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, suffix + path.extname(file.originalname));
    }
  })
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ========== AUTENTICAÇÃO ==========
const handleLogin = (req, res) => {
  try {
    const { password } = req.body;
    const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPass) {
      const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' });
      return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, error: 'Senha incorreta' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};

app.post('/api/login', handleLogin);
app.post('/api/auth/login', handleLogin);

app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';
  try {
    jwt.verify(token, jwtSecret);
    return res.json({ valid: true });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
});

// ========== UPLOAD ==========
app.post('/api/admin/upload', authenticateToken, (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    uploadMemory.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado' });

      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataUri = 'data:' + req.file.mimetype + ';base64,' + b64;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'cliquezoom' });
        
        return res.json({
          ok: true,
          success: true,
          filename: result.original_filename,
          url: result.secure_url
        });
      } catch (error) {
        console.error('Erro Cloudinary:', error);
        return res.status(500).json({ ok: false, error: 'Falha no upload' });
      }
    });
  } else {
    uploadDisk.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado' });

      res.json({
        ok: true,
        success: true,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
      });
    });
  }
});

// ========== HERO (JSON) ==========
const heroPath = path.join(__dirname, 'data', 'hero-data.json');

function readHeroData() {
  try {
    const data = fs.readFileSync(heroPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler hero-data.json:', error);
    return {
      title: 'CLIQUE·ZOOM',
      subtitle: 'Fotografia Minimalista e Autêntica',
      image: '',
      transform: { scale: 1, posX: 50, posY: 50 },
      titleTransform: { posX: 50, posY: 40 },
      subtitleTransform: { posX: 50, posY: 55 },
      titleFontSize: 48,
      subtitleFontSize: 18,
      topBarHeight: 0,
      bottomBarHeight: 0,
      overlayOpacity: 30
    };
  }
}

function writeHeroData(data) {
  try {
    fs.writeFileSync(heroPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar hero-data.json:', error);
    return false;
  }
}

app.get('/api/hero', (req, res) => {
  try {
    const heroData = readHeroData();
    res.json(heroData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do hero' });
  }
});

app.put('/api/hero', authenticateToken, (req, res) => {
  try {
    const heroData = req.body;
    
    if (writeHeroData(heroData)) {
      res.json({ success: true, message: 'Hero atualizado com sucesso', data: heroData });
    } else {
      res.status(500).json({ error: 'Erro ao salvar hero' });
    }
  } catch (error) {
    console.error('Erro ao atualizar hero:', error);
    res.status(500).json({ error: 'Erro ao atualizar hero' });
  }
});

// ========== SITE DATA ==========
const findSiteDataAny = async () => {
  if (mongoose.connection.readyState !== 1) return { data: null, source: null };

  try {
    const primary = await SiteData.findOne().sort({ updatedAt: -1 }).lean();
    if (primary) return { data: primary, source: 'model' };
  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
  }
  return { data: null, source: null };
};

app.get('/api/site-data', async (req, res) => {
  try {
    const result = await findSiteDataAny();
    
    if (result.data) {
      if (result.source !== 'model') {
        await SiteData.collection.updateOne({}, { $set: result.data }, { upsert: true });
      }
      return res.json(result.data);
    }
    return res.json({});
  } catch (error) {
    console.error('Erro ao carregar dados:', error.message);
    return res.json({});
  }
});

app.get('/api/site-config', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await SiteData.findOne().sort({ updatedAt: -1 });
      return res.json({ maintenance: data?.maintenance || { enabled: false } });
    }
    return res.json({ maintenance: { enabled: false } });
  } catch (error) {
    console.error('Erro ao carregar config:', error.message);
    return res.json({ maintenance: { enabled: false } });
  }
});

app.put('/api/site-data', authenticateToken, async (req, res) => {
  try {
    await SiteData.collection.updateOne({}, { $set: req.body }, { upsert: true });
    const updatedData = await SiteData.findOne().sort({ updatedAt: -1 });
    res.json({ ok: true, message: 'Salvo com sucesso', data: updatedData || req.body });
  } catch (error) {
    console.error('Erro ao salvar dados:', error.message);
    res.status(500).json({ ok: false, error: 'Erro ao salvar' });
  }
});

app.post('/api/admin/site-config', authenticateToken, async (req, res) => {
  try {
    await SiteData.collection.updateOne({}, { $set: req.body }, { upsert: true });
    res.json({ ok: true, success: true });
  } catch (error) {
    console.error('Erro ao salvar config:', error);
    res.status(500).json({ ok: false, error: 'Erro ao salvar configurações' });
  }
});

// ========== NEWSLETTER ==========
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
      }
      return res.json({ success: true, alreadySubscribed: true, message: 'Já inscrito' });
    }

    await Newsletter.create({ email });
    res.json({ success: true, message: 'Inscrito com sucesso' });
  } catch (error) {
    console.error('Erro newsletter:', error);
    res.status(500).json({ error: 'Erro ao inscrever' });
  }
});

app.get('/api/newsletter', authenticateToken, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ subscribers, pagination: { total: subscribers.length } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar inscritos' });
  }
});

app.delete('/api/newsletter/:email', authenticateToken, async (req, res) => {
  try {
    await Newsletter.findOneAndDelete({ email: req.params.email });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover' });
  }
});

// ========== FAQ ==========
const faqPath = path.join(__dirname, 'data', 'faq-data.json');

function readFAQData() {
  try {
    const data = fs.readFileSync(faqPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { faqs: [] };
  }
}

function writeFAQData(data) {
  try {
    fs.writeFileSync(faqPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar FAQ:', error);
    return false;
  }
}

app.get('/api/faq', (req, res) => {
  try {
    const data = readFAQData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar FAQs' });
  }
});

app.post('/api/faq', authenticateToken, (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Pergunta e resposta são obrigatórias' });
    }

    const data = readFAQData();
    const newFAQ = {
      id: `faq-${Date.now()}`,
      question,
      answer
    };
    data.faqs.push(newFAQ);

    if (writeFAQData(data)) {
      res.json({ success: true, faq: newFAQ });
    } else {
      res.status(500).json({ error: 'Erro ao salvar FAQ' });
    }
  } catch (error) {
    console.error('Erro ao adicionar FAQ:', error);
    res.status(500).json({ error: 'Erro ao adicionar FAQ' });
  }
});

app.put('/api/faq/:index', authenticateToken, (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = readFAQData();

    if (index < 0 || index >= data.faqs.length) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    if (req.body.question !== undefined) data.faqs[index].question = req.body.question;
    if (req.body.answer !== undefined) data.faqs[index].answer = req.body.answer;

    if (writeFAQData(data)) {
      res.json({ success: true, faq: data.faqs[index] });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar FAQ' });
    }
  } catch (error) {
    console.error('Erro ao atualizar FAQ:', error);
    res.status(500).json({ error: 'Erro ao atualizar FAQ' });
  }
});

app.delete('/api/faq/:index', authenticateToken, (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = readFAQData();

    if (index < 0 || index >= data.faqs.length) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    data.faqs.splice(index, 1);

    if (writeFAQData(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Erro ao remover FAQ' });
    }
  } catch (error) {
    console.error('Erro ao remover FAQ:', error);
    res.status(500).json({ error: 'Erro ao remover FAQ' });
  }
});

app.post('/api/faq/:index/move', authenticateToken, (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { direction } = req.body;
    const data = readFAQData();

    if (index < 0 || index >= data.faqs.length) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    if (direction === 'up' && index > 0) {
      [data.faqs[index - 1], data.faqs[index]] = [data.faqs[index], data.faqs[index - 1]];
    } else if (direction === 'down' && index < data.faqs.length - 1) {
      [data.faqs[index], data.faqs[index + 1]] = [data.faqs[index + 1], data.faqs[index]];
    } else {
      return res.status(400).json({ error: 'Movimento inválido' });
    }

    if (writeFAQData(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Erro ao mover FAQ' });
    }
  } catch (error) {
    console.error('Erro ao mover FAQ:', error);
    res.status(500).json({ error: 'Erro ao mover FAQ' });
  }
});

// ========== SESSÕES DO CLIENTE (MongoDB) ==========

// CLIENTE: Validar código de acesso
app.post('/api/client/verify-code', async (req, res) => {
  try {
    const { accessCode } = req.body;
    if (!accessCode) {
      return res.status(400).json({ error: 'Código de acesso obrigatório' });
    }

    const session = await Session.findOne({ accessCode, isActive: true });

    if (!session) {
      return res.status(401).json({ error: 'Código inválido' });
    }

    res.json({
      success: true,
      sessionId: session._id,
      clientName: session.name,
      galleryDate: new Date(session.date).toLocaleDateString('pt-BR'),
      sessionType: session.type,
      totalPhotos: session.photos.length,
      watermark: session.watermark,
      canShare: session.canShare
    });
  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ error: 'Erro ao validar código' });
  }
});

// CLIENTE: Listar fotos da sessão
app.get('/api/client/photos/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json({
      success: true,
      photos: session.photos.map(p => ({
        id: p.id,
        url: p.url,
        filename: p.filename
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
});

// ADMIN: Criar nova sessão
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { name, type, date } = req.body;
    
    console.log('Recebido:', { name, type, date });
    
    if (!name || !type || !date) {
      return res.status(400).json({ error: 'Nome, tipo e data são obrigatórios' });
    }

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newSession = new Session({
      name,
      type,
      date: new Date(date),
      accessCode,
      photos: [],
      watermark: true,
      canShare: false,
      isActive: true
    });

    await newSession.save();
    
    res.json({ success: true, session: newSession });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão: ' + error.message });
  }
});

// ADMIN: Listar todas as sessões
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ error: 'Erro ao buscar sessões' });
  }
});

// ADMIN: Deletar sessão
app.delete('/api/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    res.status(500).json({ error: 'Erro ao deletar sessão' });
  }
});

// ADMIN: Upload de fotos para sessão (com middleware de upload)
app.post('/api/sessions/:sessionId/photos', authenticateToken, (req, res, next) => {
  console.log('🔵 Requisição recebida em /api/sessions/:sessionId/photos');
  console.log('🔵 SessionId:', req.params.sessionId);
  console.log('🔵 Content-Type:', req.headers['content-type']);
  next();
}, uploadMemory.array('photos', 50), async (req, res) => {
  try {
    console.log('📸 Iniciando upload de fotos para sessão:', req.params.sessionId);
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      console.log('❌ Sessão não encontrada:', sessionId);
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    if (!req.files || req.files.length === 0) {
      console.log('❌ Nenhuma foto fornecida');
      return res.status(400).json({ error: 'Nenhuma foto fornecida' });
    }

    console.log(`📦 Recebidas ${req.files.length} foto(s)`);
    const uploadedPhotos = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        console.log(`📤 Upload ${i+1}/${req.files.length}: ${file.originalname} (${(file.size/1024).toFixed(2)}KB)`);
        
        // Converter buffer para data URI (mesmo padrão do /api/admin/upload)
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
        
        console.log(`☁️  Enviando para Cloudinary...`);
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'cliquezoom/sessions',
          resource_type: 'auto'
        });

        const photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          filename: file.originalname,
          url: result.secure_url,
          uploadedAt: new Date()
        };

        session.photos.push(photo);
        uploadedPhotos.push(photo);
        console.log(`✅ Upload concluído: ${photo.id}`);
      } catch (uploadError) {
        console.error(`❌ Erro ao fazer upload de ${file.originalname}:`, uploadError.message || uploadError);
        errors.push({ filename: file.originalname, error: uploadError.message || 'Erro desconhecido' });
      }
    }

    if (uploadedPhotos.length === 0) {
      console.log('❌ Nenhuma foto foi enviada com sucesso');
      return res.status(500).json({ 
        error: 'Nenhuma foto foi enviada com sucesso', 
        details: errors 
      });
    }

    console.log(`💾 Salvando sessão com ${session.photos.length} foto(s) total...`);
    await session.save();
    console.log(`✅ Sessão salva! Total de fotos: ${session.photos.length}`);
    
    res.json({ 
      success: true, 
      photos: uploadedPhotos,
      totalPhotos: session.photos.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Erro geral ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload', details: error.message });
  }
});

// ADMIN: Remover foto da sessão
app.delete('/api/sessions/:sessionId/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { sessionId, photoId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    const photoIndex = session.photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    session.photos.splice(photoIndex, 1);
    await session.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    res.status(500).json({ error: 'Erro ao remover foto' });
  }
});

module.exports = app;

// Em desenvolvimento, iniciar servidor local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\nServidor rodando na porta ${PORT}`);
  });
}
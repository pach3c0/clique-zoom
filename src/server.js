const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const SiteData = require('./models/SiteData');
const Newsletter = require('./models/Newsletter');

const app = express();

// Configurações Básicas
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limite aumentado para dados grandes
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads locais em desenvolvimento)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/assets', express.static(path.join(__dirname, '../assets')));
// Servir Frontend (Public, Admin, Cliente)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/cliente', express.static(path.join(__dirname, '../cliente')));

// Rota para Galeria do Cliente (SPA)
app.get('/galeria/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../cliente/index.html'));
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cliquezoom';
console.log('🔄 Iniciando conexão MongoDB...');
console.log('URI configurada:', !!process.env.MONGODB_URI);
console.log('URI length:', mongoUri.length);
console.log('URI host:', mongoUri.includes('@') ? mongoUri.split('@')[1].split('/')[0] : 'local');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 60000,      // 60 segundos
  connectTimeoutMS: 60000,              // 60 segundos
  socketTimeoutMS: 60000,               // 60 segundos
  keepAlive: true,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 20,
  minPoolSize: 5
})
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
    console.log('📦 Status:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar MongoDB:');
    console.error('  Mensagem:', err.message);
    console.error('  Código:', err.code);
    console.error('  Name:', err.name);
    if (err.reason) console.error('  Reason:', err.reason);
    console.error('  Stack:', err.stack);
  });

// Evento de desconexão - Tentar reconectar
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado. Tentando reconectar em 5s...');
  setTimeout(() => {
    mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      keepAlive: true,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 20,
      minPoolSize: 5
    }).catch(err => console.error('❌ Erro ao reconectar:', err.message));
  }, 5000);
});

// Health Check
app.get('/api/health', async (req, res) => {
  const readyState = mongoose.connection.readyState;
  const readyStateText = ['desconectado', 'conectado', 'conectando', 'desconectando'][readyState] || 'desconhecido';
  
  try {
    let mongoTest = null;
    if (readyState === 1) {
      mongoTest = await SiteData.findOne().lean();
    }
    
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      mongodb: {
        state: readyState,
        stateText: readyStateText,
        hasData: !!mongoTest
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      mongodb: {
        state: readyState,
        stateText: readyStateText
      }
    });
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro de conexão MongoDB:', err);
});

// Configuração Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuração Multer - Estratégias Diferentes para Dev/Prod
const storageMemory = multer.memoryStorage();
const uploadMemory = multer({ storage: storageMemory });

const storageDisk = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadDisk = multer({ storage: storageDisk });

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.warn('⚠️  Token não fornecido em:', req.method, req.path);
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.warn('⚠️  Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    console.log('✅ Token válido para:', req.method, req.path);
    req.user = user;
    next();
  });
};

// Rota de Login (Gera o Token JWT)
const handleLogin = (req, res) => {
  try {
    const { password } = req.body;
    
    const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Verifica a senha contra a variável de ambiente
    if (password === adminPass) {
      const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' });
      console.log('✅ Token gerado com sucesso');
      return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, error: 'Senha incorreta' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

app.post('/api/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// Verificar token (para validar sessão no frontend)
app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const jwtSecret = process.env.JWT_SECRET || 'clique-zoom-secret-key';

  try {
    jwt.verify(token, jwtSecret);
    return res.json({ valid: true });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
});

// Rota de Upload (Implementação do Padrão Especificado)
app.post('/api/admin/upload', authenticateToken, (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // Produção: Cloudinary (via Memory Storage)
    uploadMemory.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado' });

      try {
        // Converter buffer para Data URI para o Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataUri = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'cliquezoom' });
        
        return res.json({
          ok: true,
          success: true,
          filename: result.original_filename,
          url: result.secure_url // OBRIGATÓRIO
        });
      } catch (error) {
        console.error('Erro Cloudinary:', error);
        return res.status(500).json({ ok: false, error: 'Falha no upload para Cloudinary' });
      }
    });
  } else {
    // Desenvolvimento: Filesystem Local
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

const siteDataCollectionsFallback = ['site_data'];

const findSiteDataAny = async () => {
  // Verificar se conexão está ativa
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️  MongoDB não conectado. Estado:', mongoose.connection.readyState);
    return { data: null, source: null };
  }

  try {
    const primary = await SiteData.findOne().sort({ updatedAt: -1 }).lean();
    if (primary) return { data: primary, source: 'model' };
  } catch (error) {
    console.error('❌ Erro ao buscar em sitedatas:', error.message);
  }

  const db = mongoose.connection?.db;
  if (!db) return { data: null, source: null };

  for (const name of siteDataCollectionsFallback) {
    try {
      const doc = await db.collection(name).find({}).sort({ updatedAt: -1 }).limit(1).next();
      if (doc) return { data: doc, source: name };
    } catch (error) {
      // Ignorar coleções inexistentes
    }
  }

  return { data: null, source: null };
};

// Rota Pública para Carregar Dados do Site (Frontend usa isso ao iniciar)
app.get('/api/site-data', async (req, res) => {
  try {
    console.log('\n📥 GET /api/site-data');
    console.log('   Mongoose state:', mongoose.connection.readyState);
    
    const result = await findSiteDataAny();
    
    console.log('   Resultado:', {
      hasData: !!result.data,
      source: result.source,
      keys: result.data ? Object.keys(result.data).slice(0, 5) : []
    });
    
    if (result.data) {
      if (result.source !== 'model') {
        console.log('   🔄 Migrando dados para sitedatas...');
        await SiteData.collection.updateOne(
          {},
          { $set: result.data },
          { upsert: true }
        );
      }
      return res.json(result.data);
    }
    
    console.warn('   ⚠️  Nenhum dado encontrado, retornando vazio');
    return res.json({});
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

// Rota para Configurações do Site (Manutenção, etc)
app.get('/api/site-config', async (req, res) => {
  try {
    const data = await SiteData.findOne().sort({ updatedAt: -1 }) || {};
    // Retorna apenas campos de configuração se existirem, ou defaults
    res.json({ maintenance: data.maintenance || { enabled: false } });
  } catch (error) {
    console.error('Erro ao carregar config:', error);
    res.status(500).json({ error: 'Erro ao carregar configurações' });
  }
});

// Rota de Auto-Save (Recebe o appData completo ou parcial)
app.put('/api/site-data', authenticateToken, async (req, res) => {
  try {
    console.log('\ud83d\udcd4 PUT /api/site-data recebido com:', Object.keys(req.body).join(', '));
    const appData = req.body;
    
    // Atualiza o único documento existente ou cria um novo (upsert: true)
    await SiteData.collection.updateOne(
      {}, // Filtro vazio para pegar sempre o mesmo documento "global"
      { $set: appData },
      { upsert: true }
    );
    // Recuperar o documento atualizado
    const updatedData = await SiteData.findOne().sort({ updatedAt: -1 });
    
    console.log('✅ Dados salvos com sucesso em Mongo');
    res.json({ ok: true, message: 'Salvo com sucesso', data: updatedData || appData });
  } catch (error) {
    console.error('\u274c Erro ao salvar dados:', error.message);
    res.status(500).json({ ok: false, error: 'Erro ao salvar' });
  }
});

// Rota para Salvar Configurações (Manutenção)
app.post('/api/admin/site-config', authenticateToken, async (req, res) => {
  try {
    const configData = req.body; // Espera { maintenance: { ... } }
    
    await SiteData.collection.updateOne(
      {},
      { $set: configData },
      { upsert: true }
    );
    
    res.json({ ok: true, success: true });
  } catch (error) {
    console.error('Erro ao salvar config:', error);
    res.status(500).json({ ok: false, error: 'Erro ao salvar configurações' });
  }
});

// --- ROTAS DE NEWSLETTER ---

// Inscrever (Público)
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    // Verifica se já existe
    const existing = await Newsletter.findOne({ email });
    if (existing) {
        if (!existing.active) {
            existing.active = true;
            await existing.save();
            return res.json({ success: true, message: 'Reativado com sucesso' });
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

// Listar Inscritos (Admin)
app.get('/api/newsletter', authenticateToken, async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.json({ 
            subscribers, 
            pagination: { total: subscribers.length } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar inscritos' });
    }
});

// Remover Inscrito (Admin)
app.delete('/api/newsletter/:email', authenticateToken, async (req, res) => {
    try {
        await Newsletter.findOneAndDelete({ email: req.params.email });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
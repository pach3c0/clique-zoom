// Handler para Vercel Serverless Functions
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('../src/config/database');
const dataHelper = require('../src/helpers/data-helper');
const apiRoutes = require('../src/routes/api');
const cloudinary = require('cloudinary').v2;

const app = express();
const rootDir = path.join(__dirname, '..');

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

const defaultSiteConfig = {
  maintenance: {
    enabled: false,
    title: 'Estamos em manutenção',
    message: 'Estamos ajustando alguns detalhes. Volte em breve.'
  }
};

// Garantir conexão MongoDB antes de cada requisição
let dbReady = false;
const dbPromise = connectDB()
  .then(() => dataHelper.checkMongoDB())
  .then(() => { dbReady = true; })
  .catch(err => {
    console.warn('⚠️  MongoDB offline:', err.message);
  });

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Aguardar MongoDB estar pronto antes de processar requisições
app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await dbPromise;
    } catch (e) {
      // continua sem MongoDB
    }
  }
  next();
});

// Serve static assets
app.use('/assets', express.static(path.join(rootDir, 'assets')));

// API Routes
app.use('/api', apiRoutes);

// ========================================
// FILE UPLOAD CONFIGURATION
// ========================================
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
      return cb(new Error('FILE_EXISTS'));
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

// ========================================
// CAMADA 1: SITE PÚBLICO (Portfolio)
// ========================================
app.get('/preview', (req, res) => {
  res.sendFile(path.join(rootDir, 'public/index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'public/index.html'));
});

// ========================================
// CAMADA 2: PAINEL ADMIN
// ========================================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin/index.html'));
});

// Admin API: Get site config
app.get('/api/admin/site-config', async (req, res) => {
  try {
    const data = await dataHelper.getSiteData();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar config do site:', error);
    res.status(500).json({ error: 'Erro ao buscar config do site' });
  }
});

// Site Config API (admin)
app.post('/api/admin/site-config', async (req, res) => {
  try {
    const maintenance = req.body?.maintenance || {};
    const current = await dataHelper.getSiteData();
    const next = {
      ...current,
      maintenance: {
        enabled: maintenance.enabled === true,
        title: maintenance.title || defaultSiteConfig.maintenance.title,
        message: maintenance.message || defaultSiteConfig.maintenance.message
      }
    };
    const data = await dataHelper.updateSiteData(next);
    res.json({ success: true, maintenance: data.maintenance });
  } catch (error) {
    console.error('Erro ao salvar config do site:', error);
    res.status(500).json({ error: 'Erro ao salvar config do site' });
  }
});

// Admin API: Update portfolio data
app.post('/api/admin/portfolio', (req, res) => {
  const filePath = path.join(rootDir, 'assets/data/portfolio-data.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar portfólio' });
    }
    res.json({ success: true, message: 'Portfólio atualizado' });
  });
});

// Admin API: Upload image
app.post('/api/admin/upload', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    if (!isCloudinaryConfigured) {
      return res.status(503).json({
        error: 'Upload desabilitado em produção. Configure Cloudinary ou use URLs externas.'
      });
    }

    return uploadMemory.single('image')(req, res, async (err) => {
      if (err) {
        if (err.message === 'INVALID_FILE_TYPE') {
          return res.status(400).json({ error: 'Apenas imagens JPG ou PNG são permitidas' });
        }
        return res.status(500).json({ error: 'Erro ao fazer upload' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      try {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'cliquezoom'
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
    });
  }

  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'Apenas imagens JPG ou PNG são permitidas' });
      }
      if (err.message === 'FILE_EXISTS') {
        return res.status(409).json({ error: 'Já existe uma imagem com esse nome' });
      }
      return res.status(500).json({ error: 'Erro ao fazer upload' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  });
});

// ========================================
// CAMADA 3: GALERIA PRIVADA DO CLIENTE
// ========================================
app.get('/galeria/:galleryId', (req, res) => {
  res.sendFile(path.join(rootDir, 'cliente/index.html'));
});

app.get('/api/galeria/:galleryId', (req, res) => {
  res.json({
    success: true,
    galleryId: req.params.galleryId,
    fotos: [],
    configuracao: {
      podem_compartilhar: false,
      limite_downloads: null,
      marca_dagua: true,
      preco: 0,
      status: 'bloqueado'
    }
  });
});

app.post('/api/galeria/:galleryId/download', (req, res) => {
  res.json({ success: true, message: 'Download iniciado' });
});

// ========================================
// ROTAS PÚBLICAS (Assets)
// ========================================
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ========================================
// EXPORTAR PARA VERCEL
// ========================================
module.exports = app;

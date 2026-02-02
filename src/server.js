require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('./config/database');
const dataHelper = require('./helpers/data-helper');
const apiRoutes = require('./routes/api');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3050;

// Conectar ao MongoDB
connectDB().catch(err => console.warn('MongoDB offline, usando fallback'));
dataHelper.checkMongoDB();

const defaultSiteConfig = {
  maintenance: {
    enabled: false,
    title: 'Estamos em manutenção',
    message: 'Estamos ajustando alguns detalhes. Volte em breve.'
  }
};

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

function renderMaintenancePage(config) {
  const title = config?.maintenance?.title || defaultSiteConfig.maintenance.title;
  const message = config?.maintenance?.message || defaultSiteConfig.maintenance.message;
  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: 'Inter', sans-serif; background:#070707; color:#fff; }
        .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:32px; position:relative; overflow:hidden; }
        .glow { position:absolute; inset:auto -20% -30% -20%; height:60vh; background:radial-gradient(ellipse at center, rgba(255,255,255,0.08), rgba(255,255,255,0)); filter: blur(10px); }
        .veil { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.9)); }
        .card { position:relative; max-width:720px; width:100%; text-align:center; background:rgba(12,12,12,0.72); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:56px 40px; box-shadow:0 20px 60px rgba(0,0,0,0.55); backdrop-filter: blur(12px); }
        .badge { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:999px; font-size:12px; letter-spacing:1px; text-transform:uppercase; border:1px solid rgba(255,255,255,0.16); color:#d9d9d9; margin-bottom:18px; }
        h1 { font-family:'Playfair Display', serif; font-size:38px; margin:0 0 12px; }
        p { font-size:16px; line-height:1.7; color:#c7c7c7; margin:0; }
        .divider { margin:28px auto 0; width:64px; height:2px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); }
        .brand { margin-top:22px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#8c8c8c; }
        @media (max-width: 640px) {
          .card { padding:44px 28px; }
          h1 { font-size:30px; }
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="glow"></div>
        <div class="veil"></div>
        <div class="card">
          <div class="badge">Cortina ativa</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <div class="divider"></div>
          <div class="brand">CLIQUE·ZOOM</div>
        </div>
      </div>
    </body>
  </html>`;
}

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API Routes
app.use('/api', apiRoutes);

// ========================================
// FILE UPLOAD CONFIGURATION
// ========================================
const allowedImageTypes = new Set(['image/jpeg', 'image/png']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/\s+/g, '-');
    const targetPath = path.join(__dirname, '../uploads', safeName);
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
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/', async (req, res) => {
  try {
    const data = await dataHelper.getSiteData();
    const maintenanceEnabled = data?.maintenance?.enabled === true;
    if (maintenanceEnabled) {
      return res.status(503).send(renderMaintenancePage({ maintenance: data.maintenance }));
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } catch (error) {
    console.error('Erro ao carregar dados do site:', error);
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// API: Get portfolio data
app.get('/api/portfolio', (req, res) => {
  const filePath = path.join(__dirname, '../assets/data/portfolio-data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler dados de portfólio' });
    }
    res.json(JSON.parse(data));
  });
});

// API: Get style guide data
app.get('/api/style-guide', (req, res) => {
  const filePath = path.join(__dirname, '../assets/data/style-cards.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler guia de estilo' });
    }
    res.json(JSON.parse(data));
  });
});

// ========================================
// CAMADA 2: PAINEL ADMINISTRATIVO (Admin)
// ========================================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Site Config API (public)
app.get('/api/site-config', async (req, res) => {
  try {
    const data = await dataHelper.getSiteData();
    res.json({ maintenance: data?.maintenance || defaultSiteConfig.maintenance });
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
  // TODO: Adicionar autenticação aqui
  const filePath = path.join(__dirname, '../assets/data/portfolio-data.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar portfólio' });
    }
    res.json({ success: true, message: 'Portfólio atualizado' });
  });
});

// Admin API: Upload image (Hero, Portfolio, etc)
app.post('/api/admin/upload', (req, res) => {
  // Em produção (Vercel), filesystem é read-only
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
  res.sendFile(path.join(__dirname, '../cliente/index.html'));
});

// Client Gallery API: Get gallery data (private, with token)
app.get('/api/galeria/:galleryId', (req, res) => {
  // TODO: Verificar token/password do cliente
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

// Client Gallery API: Download photo(s)
app.post('/api/galeria/:galleryId/download', (req, res) => {
  // TODO: Gerar marca d'água, comprimir, enviar
  res.json({ success: true, message: 'Download iniciado' });
});

// ========================================
// ROTAS PÚBLICAS (Assets)
// ========================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ========================================
// START SERVER
// ========================================
const server = app.listen(PORT, '0.0.0.0', () => {
  const env = process.env.NODE_ENV || 'development';
  const host = process.env.VERCEL_URL || `localhost:${PORT}`;
  console.log(`✅ Servidor rodando (${env}) em http://${host}`);
  console.log(`📸 Site Público: http://${host}`);
  console.log(`🔧 Painel Admin: http://${host}/admin`);
  console.log(`👁️  Galeria Cliente: http://${host}/galeria/[id]`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('Servidor fechado');
    process.exit(0);
  });
});

// Handler para Vercel Serverless Functions
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../src/config/database');
const dataHelper = require('../src/helpers/data-helper');
const apiRoutes = require('../src/routes/api');

const app = express();
const rootDir = path.join(__dirname, '..');

const defaultSiteConfig = {
  maintenance: {
    enabled: false,
    title: 'Estamos em manutenção',
    message: 'Estamos ajustando alguns detalhes. Volte em breve.'
  }
};

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Aguardar MongoDB estar pronto antes de processar requisições
app.use(async (req, res, next) => {
  try {
    // Tenta conectar (idempotente graças à verificação de estado no connectDB)
    await connectDB();
    await dataHelper.checkMongoDB();
  } catch (e) {
    console.warn('⚠️  Continuando sem MongoDB:', e.message);
  }
  next();
});

// Serve static assets
app.use('/assets', express.static(path.join(rootDir, 'assets')));

// API Routes
app.use('/api', apiRoutes);

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

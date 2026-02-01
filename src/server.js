const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3050;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// ========================================
// FILE UPLOAD CONFIGURATION
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ========================================
// CAMADA 1: SITE PÚBLICO (Portfolio)
// ========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  res.json({ 
    success: true, 
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
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

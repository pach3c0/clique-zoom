const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/cliente', express.static(path.join(__dirname, '../cliente')));

// SPA route for client gallery
app.get('/galeria/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../cliente/index.html'));
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cliquezoom';
let isConnected = false;

const connectWithRetry = async () => {
  if (isConnected) return;

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
    console.log('MongoDB conectado com sucesso');
  } catch (err) {
    console.error('Erro na conexão MongoDB:', err.message);
    isConnected = false;
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(connectWithRetry, 5000);
    }
  }
};

connectWithRetry();

mongoose.connection.on('error', (err) => {
  console.error('Erro de conexão MongoDB:', err.message);
});

// Health check
const SiteData = require('./models/SiteData');

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

// API Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/hero'));
app.use('/api', require('./routes/faq'));
app.use('/api', require('./routes/site-data'));
app.use('/api', require('./routes/newsletter'));
app.use('/api', require('./routes/sessions'));
app.use('/api', require('./routes/upload'));

module.exports = app;

// Em desenvolvimento, iniciar servidor local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\nServidor rodando na porta ${PORT}`);
  });
}

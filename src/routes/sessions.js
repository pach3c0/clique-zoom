const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Session = require('../models/Session');
const { authenticateToken } = require('../middleware/auth');

// Garantir que o diretorio existe
const sessionsDir = path.join(__dirname, '../../uploads/sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

const sessionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, sessionsDir),
  filename: (req, file, cb) => {
    const suffix = crypto.randomBytes(8).toString('hex');
    cb(null, suffix + path.extname(file.originalname));
  }
});

const uploadSession = multer({
  storage: sessionStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 50 }
});

// CLIENTE: Validar codigo de acesso
router.post('/client/verify-code', async (req, res) => {
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
      accessCode: session.accessCode,
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

// CLIENTE: Listar fotos da sessao (requer accessCode via query param)
router.get('/client/photos/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { code } = req.query;

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Verificar codigo de acesso
    if (session.accessCode !== code) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
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

// ADMIN: Criar nova sessao
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { name, type, date } = req.body;

    if (!name || !type || !date) {
      return res.status(400).json({ error: 'Nome, tipo e data são obrigatórios' });
    }

    const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();

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

// ADMIN: Listar todas as sessoes
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ error: 'Erro ao buscar sessões' });
  }
});

// ADMIN: Deletar sessao
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    res.status(500).json({ error: 'Erro ao deletar sessão' });
  }
});

// ADMIN: Upload de fotos para sessao
router.post('/sessions/:sessionId/photos', authenticateToken, uploadSession.array('photos', 50), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma foto fornecida' });
    }

    const uploadedPhotos = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const photo = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        filename: file.originalname,
        url: `/uploads/sessions/${file.filename}`,
        uploadedAt: new Date()
      };

      session.photos.push(photo);
      uploadedPhotos.push(photo);
    }

    await session.save();

    res.json({
      success: true,
      photos: uploadedPhotos,
      totalPhotos: session.photos.length
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload', details: error.message });
  }
});

// ADMIN: Remover foto da sessao
router.delete('/sessions/:sessionId/photos/:photoId', authenticateToken, async (req, res) => {
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

    // Deletar arquivo do disco se for local
    const photo = session.photos[photoIndex];
    if (photo.url && photo.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', photo.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    session.photos.splice(photoIndex, 1);
    await session.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    res.status(500).json({ error: 'Erro ao remover foto' });
  }
});

module.exports = router;

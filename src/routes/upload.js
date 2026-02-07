const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

// Garantir que o diretorio existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const suffix = crypto.randomBytes(8).toString('hex');
    cb(null, suffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'Nenhum arquivo enviado' });

  res.json({
    ok: true,
    success: true,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

module.exports = router;

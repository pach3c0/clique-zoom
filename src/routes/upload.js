const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { cloudinary, uploadMemory, uploadDisk } = require('../config/cloudinary');

router.post('/admin/upload', authenticateToken, (req, res) => {
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

module.exports = router;

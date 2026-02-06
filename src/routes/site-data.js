const router = require('express').Router();
const mongoose = require('mongoose');
const SiteData = require('../models/SiteData');
const { authenticateToken } = require('../middleware/auth');

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

router.get('/site-data', async (req, res) => {
  try {
    const result = await findSiteDataAny();

    if (result.data) {
      return res.json(result.data);
    }
    return res.json({});
  } catch (error) {
    console.error('Erro ao carregar dados:', error.message);
    return res.json({});
  }
});

router.get('/site-config', async (req, res) => {
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

router.put('/site-data', authenticateToken, async (req, res) => {
  try {
    await SiteData.collection.updateOne({}, { $set: req.body }, { upsert: true });
    const updatedData = await SiteData.findOne().sort({ updatedAt: -1 });
    res.json({ ok: true, message: 'Salvo com sucesso', data: updatedData || req.body });
  } catch (error) {
    console.error('Erro ao salvar dados:', error.message);
    res.status(500).json({ ok: false, error: 'Erro ao salvar' });
  }
});

router.post('/admin/site-config', authenticateToken, async (req, res) => {
  try {
    await SiteData.collection.updateOne({}, { $set: req.body }, { upsert: true });
    res.json({ ok: true, success: true });
  } catch (error) {
    console.error('Erro ao salvar config:', error);
    res.status(500).json({ ok: false, error: 'Erro ao salvar configurações' });
  }
});

module.exports = router;

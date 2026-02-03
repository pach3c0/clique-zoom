const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  image: { type: String, required: true },
  posX: { type: Number, default: 50 },
  posY: { type: Number, default: 50 },
  scale: { type: Number, default: 1 },
  ratio: { type: String, default: '3/4' }
}, { _id: false });

const transformSchema = new mongoose.Schema({
  scale: { type: Number, default: 1 },
  posX: { type: Number, default: 50 },
  posY: { type: Number, default: 50 }
}, { _id: false });

const positionSchema = new mongoose.Schema({
  posX: { type: Number, default: 50 },
  posY: { type: Number, default: 50 }
}, { _id: false });

const heroSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  transform: { type: transformSchema, default: () => ({ scale: 1, posX: 50, posY: 50 }) },
  titleTransform: { type: positionSchema, default: () => ({ posX: 50, posY: 40 }) },
  subtitleTransform: { type: positionSchema, default: () => ({ posX: 50, posY: 55 }) },
  titleFontSize: { type: Number, default: 48 },
  subtitleFontSize: { type: Number, default: 18 },
  topBarHeight: { type: Number, default: 0 },
  bottomBarHeight: { type: Number, default: 0 },
  overlayOpacity: { type: Number, default: 30 }
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  image: { type: String, default: '' }
}, { _id: false });

const whatsappMessageSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  delay: { type: Number, default: 5 }
}, { _id: false });

const studioPhotoSchema = new mongoose.Schema({
  image: { type: String, default: '' },
  posX: { type: Number, default: 50 },
  posY: { type: Number, default: 50 },
  scale: { type: Number, default: 1 }
}, { _id: false });

const studioSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  hours: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  whatsappMessages: { type: [whatsappMessageSchema], default: [] },
  photos: { type: [studioPhotoSchema], default: [] }
}, { _id: false });

const maintenanceSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' }
}, { _id: false });

const siteDataSchema = new mongoose.Schema({
  hero: { type: heroSchema, default: () => ({}) },
  portfolio: { type: [portfolioItemSchema], default: [] },
  about: { type: aboutSchema, default: () => ({}) },
  studio: { type: studioSchema, default: () => ({}) },
  maintenance: { type: maintenanceSchema, default: () => ({}) }
}, {
  timestamps: true,
  collection: 'sitedata',
  strict: false  // Permite campos extras não definidos no schema
});

// Função para merge profundo de objetos
function deepMerge(target, source) {
  if (!source) return target;

  const output = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) {
      continue; // Ignora valores nulos/undefined para não sobrescrever dados existentes
    }

    // Arrays são substituídos completamente (portfolio, whatsappMessages, photos)
    if (Array.isArray(source[key])) {
      output[key] = source[key];
    }
    // Objetos são mesclados recursivamente
    else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    }
    // Valores primitivos são substituídos
    else {
      output[key] = source[key];
    }
  }

  return output;
}

// Garantir que sempre existe apenas 1 documento
siteDataSchema.statics.getSiteData = async function() {
  let data = await this.findOne();
  if (!data) {
    data = await this.create({
      hero: {},
      portfolio: [],
      about: {},
      studio: {},
      maintenance: { enabled: false }
    });
  }
  return data;
};

siteDataSchema.statics.updateSiteData = async function(updates) {
  let data = await this.findOne();
  if (!data) {
    data = await this.create(updates);
  } else {
    // Fazer merge profundo para não perder dados existentes
    const currentData = data.toObject();
    delete currentData._id;
    delete currentData.__v;
    delete currentData.createdAt;
    delete currentData.updatedAt;

    const merged = deepMerge(currentData, updates);

    // Atualizar cada campo individualmente
    if (merged.hero) data.hero = merged.hero;
    if (merged.about) data.about = merged.about;
    if (merged.studio) data.studio = merged.studio;
    if (merged.maintenance) data.maintenance = merged.maintenance;
    if (merged.portfolio) data.portfolio = merged.portfolio;

    data.markModified('hero');
    data.markModified('about');
    data.markModified('studio');
    data.markModified('maintenance');
    data.markModified('portfolio');

    await data.save();
  }
  return data;
};

module.exports = mongoose.model('SiteData', siteDataSchema);

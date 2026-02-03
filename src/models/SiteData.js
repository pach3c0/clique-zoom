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

// Garantir que sempre existe apenas 1 documento
siteDataSchema.statics.getSiteData = async function() {
  let data = await this.findOne();
  if (!data) {
    data = await this.create({
      hero: { title: '', subtitle: '', image: '' },
      portfolio: [],
      about: { title: '', content: '', image: '' },
      maintenance: { enabled: false, title: '', message: '' }
    });
  }
  return data;
};

siteDataSchema.statics.updateSiteData = async function(updates) {
  let data = await this.findOne();
  if (!data) {
    data = await this.create(updates);
  } else {
    Object.assign(data, updates);
    await data.save();
  }
  return data;
};

module.exports = mongoose.model('SiteData', siteDataSchema);

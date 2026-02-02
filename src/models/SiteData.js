const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  image: { type: String, required: true },
  posX: { type: Number, default: 50 },
  posY: { type: Number, default: 50 },
  scale: { type: Number, default: 1 },
  ratio: { type: String, default: '3/4' }
}, { _id: false });

const heroSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' }
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  image: { type: String, default: '' }
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
  maintenance: { type: maintenanceSchema, default: () => ({}) }
}, {
  timestamps: true,
  collection: 'sitedata'
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

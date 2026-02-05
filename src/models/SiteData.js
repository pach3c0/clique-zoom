const mongoose = require('mongoose');

const SiteDataSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    // Usamos Mixed ou Object para 'transform' para flexibilidade com os 12 sliders
    transform: { 
      type: Map,
      of: String, // Inputs range retornam string, ou pode usar Number se converter antes
      default: {}
    }
  },
  sobre: {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  portfolio: {
    photos: [{
      id: Number,
      url: String,
      position: Number
    }]
  }
}, { 
  timestamps: true,
  strict: false // Permite adicionar novos campos pelo frontend sem quebrar o schema (útil para prototipagem rápida)
});

module.exports = mongoose.model('SiteData', SiteDataSchema);
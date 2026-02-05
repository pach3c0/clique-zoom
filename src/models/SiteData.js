const mongoose = require('mongoose');

const SiteDataSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    transform: { 
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  about: {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  portfolio: {
    type: Array,
    default: []
  },
  studio: { type: mongoose.Schema.Types.Mixed, default: {} },
  albums: { type: Array, default: [] },
  footer: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { 
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('SiteData', SiteDataSchema);
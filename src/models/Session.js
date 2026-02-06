const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: String,
    type: String, // Família, Casamento, Evento, etc
    date: Date,
    accessCode: String,
    photos: [{
        id: String,
        filename: String,
        url: String,
        uploadedAt: Date
    }],
    watermark: { type: Boolean, default: true },
    canShare: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);

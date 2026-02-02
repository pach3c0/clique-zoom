const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cliquezoom';
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.warn('⚠️  MongoDB offline, usando modo offline:', error.message);
    isConnected = false;
  }
};

module.exports = connectDB;

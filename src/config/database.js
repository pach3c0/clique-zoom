const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB já estava conectado');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cliquezoom';
    
    console.log('🔄 Tentando conectar ao MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password
    
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });

    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
    console.log('📦 Banco de dados:', connection.connection.db?.databaseName || connection.connection.name);
    
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    isConnected = false;
    throw error;
  }
};

const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: getReadyStateText(mongoose.connection.readyState)
  };
};

const getReadyStateText = (state) => {
  const states = {
    0: 'desconectado',
    1: 'conectado',
    2: 'conectando',
    3: 'desconectando'
  };
  return states[state] || 'desconhecido';
};

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;

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
    console.log('MONGODB_URI definido:', !!process.env.MONGODB_URI);
    console.log('URI preview:', MONGODB_URI.substring(0, 20) + '...' + MONGODB_URI.substring(MONGODB_URI.length - 10));
    
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,  // Aumentado para 30s (padrão robusto)
      connectTimeoutMS: 30000,          // Aumentado para 30s
      socketTimeoutMS: 45000,           // Timeout de socket para evitar quedas
      keepAlive: true,                  // Manter conexão viva
      family: 4,                        // Forçar IPv4 para evitar erros de DNS
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,                  // Máximo conservador para Serverless
      minPoolSize: 1                    // Mínimo reduzido para não estourar conexões na Vercel
    });

    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
    console.log('📦 Banco de dados:', connection.connection.db?.databaseName || connection.connection.name);
    
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    console.error('Stack:', error.stack);
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

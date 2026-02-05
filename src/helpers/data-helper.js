const SiteData = require('../models/SiteData');
const fallbackData = require('../data/fallback-data');
const mongoose = require('mongoose');

let mongoAvailable = false;
let inMemoryData = JSON.parse(JSON.stringify(fallbackData));

const fetchFromMongo = async () => {
  const data = await SiteData.findOne().lean();
  return data || null;
};

// Tentar conectar ao MongoDB
const checkMongoDB = async () => {
  try {
    // Verificar se mongoose está conectado
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  Mongoose não está conectado (state:', mongoose.connection.readyState + ')');
      mongoAvailable = false;
      return inMemoryData;
    }

    console.log('🔄 Verificando disponibilidade do MongoDB...');
    const data = await fetchFromMongo();
    mongoAvailable = true;
    console.log('✅ MongoDB disponível e funcionando');
    return data || inMemoryData;
  } catch (error) {
    mongoAvailable = false;
    console.warn('⚠️  MongoDB indisponível, usando fallback em memória:', error.message);
    return inMemoryData;
  }
};

const getSiteData = async () => {
  try {
    if (mongoAvailable && mongoose.connection.readyState === 1) {
      const data = await fetchFromMongo();
      return data || inMemoryData;
    }
  } catch (error) {
    mongoAvailable = false;
    console.warn('⚠️  Erro ao buscar dados do MongoDB:', error.message);
  }
  
  return inMemoryData;
};

// Função para merge profundo (fallback em memória)
function deepMerge(target, source) {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      output[key] = source[key];
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

const updateSiteData = async (newData) => {
  try {
    // Verificar conexão do mongoose
    if (mongoose.connection.readyState === 1 && mongoAvailable) {
      console.log('💾 Salvando dados no MongoDB...');
      console.log('   studio.whatsapp:', newData.studio?.whatsapp);
      await SiteData.collection.updateOne(
        {},
        { $set: newData },
        { upsert: true }
      );
      const result = newData;
      console.log('✅ Dados salvos no MongoDB com sucesso');
      console.log('   result.studio.whatsapp:', result.studio?.whatsapp);
      return result;
    }
  } catch (error) {
    mongoAvailable = false;
    console.error('❌ Erro ao salvar no MongoDB:', error.message);
  }

  // Fallback: merge com dados em memória
  console.log('💾 Salvando dados em memória (fallback)...');
  inMemoryData = deepMerge(inMemoryData, newData);
  return inMemoryData;
};

module.exports = {
  checkMongoDB,
  getSiteData,
  updateSiteData,
  isMongoDNavailable: () => mongoAvailable && mongoose.connection.readyState === 1
};

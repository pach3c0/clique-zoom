const SiteData = require('../models/SiteData');
const fallbackData = require('../data/fallback-data');

let mongoAvailable = false;
let inMemoryData = JSON.parse(JSON.stringify(fallbackData));

// Tentar conectar ao MongoDB
const checkMongoDB = async () => {
  try {
    const data = await SiteData.getSiteData();
    mongoAvailable = true;
    return data;
  } catch (error) {
    mongoAvailable = false;
    console.log('⚠️  MongoDB indisponível, usando fallback em memória');
    return inMemoryData;
  }
};

const getSiteData = async () => {
  if (mongoAvailable) {
    try {
      return await SiteData.getSiteData();
    } catch (error) {
      mongoAvailable = false;
      return inMemoryData;
    }
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
  if (mongoAvailable) {
    try {
      return await SiteData.updateSiteData(newData);
    } catch (error) {
      mongoAvailable = false;
      // Fallback: merge com dados em memória
      inMemoryData = deepMerge(inMemoryData, newData);
      return inMemoryData;
    }
  }
  // Merge com dados em memória (não substitui completamente)
  inMemoryData = deepMerge(inMemoryData, newData);
  return inMemoryData;
};

module.exports = {
  checkMongoDB,
  getSiteData,
  updateSiteData,
  isMongoDNavailable: () => mongoAvailable
};

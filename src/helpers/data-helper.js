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

const updateSiteData = async (newData) => {
  if (mongoAvailable) {
    try {
      return await SiteData.updateSiteData(newData);
    } catch (error) {
      mongoAvailable = false;
      inMemoryData = newData;
      return inMemoryData;
    }
  }
  inMemoryData = newData;
  return inMemoryData;
};

module.exports = {
  checkMongoDB,
  getSiteData,
  updateSiteData,
  isMongoDNavailable: () => mongoAvailable
};

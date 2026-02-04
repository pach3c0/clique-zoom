// Dados padrão para quando MongoDB não está disponível - VAZIOS
const fallbackData = {
  hero: {
    title: '',
    subtitle: '',
    image: '',
    transform: {
      scale: 1,
      posX: 50,
      posY: 50
    },
    titleTransform: {
      posX: 50,
      posY: 40
    },
    subtitleTransform: {
      posX: 50,
      posY: 50
    },
    titleFontSize: 48,
    subtitleFontSize: 18,
    topBarHeight: 0,
    bottomBarHeight: 0,
    overlayOpacity: 30
  },
  about: {
    title: '',
    text: '',
    image: ''
  },
  portfolio: [],
  albums: [],
  studio: {
    title: '',
    description: '',
    address: '',
    hours: '',
    whatsapp: '',
    whatsappMessages: [],
    photos: []
  },
  maintenance: {
    enabled: false,
    title: '',
    message: ''
  }
};

module.exports = fallbackData;

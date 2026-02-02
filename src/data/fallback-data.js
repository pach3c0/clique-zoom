// Dados padrão para quando MongoDB não está disponível
const fallbackData = {
  hero: {
    title: 'A pureza do essencial.',
    subtitle: 'Removemos o ruído visual para capturar o que realmente importa: a conexão, o gesto e a emoção crua.',
    image: 'IMG_8581.jpg',
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
    overlayOpacity: 0.3
  },
  about: {
    title: 'Quem Somos',
    text: 'CLIQUE·ZOOM é um estúdio de fotografia dedicado a capturar momentos autênticos e emocionais.'
  },
  portfolio: [
    {
      title: 'Casamento',
      description: 'Celebrações e momentos especiais',
      image: 'wedding.jpg'
    },
    {
      title: 'Retratos',
      description: 'Trabalhos autorais e sessions personalizadas',
      image: 'portraits.jpg'
    }
  ],
  studio: {
    address: 'São Paulo, SP',
    hours: '09:00 - 18:00',
    whatsapp: '+5511999999999',
    whatsappMessages: [
      { text: 'Olá! Como posso ajudar?', delay: 5 }
    ],
    photos: [
      { image: 'studio1.jpg', posX: 50, posY: 50, scale: 1 },
      { image: 'studio2.jpg', posX: 50, posY: 50, scale: 1 }
    ]
  },
  maintenance: {
    enabled: false,
    title: 'Manutenção',
    message: 'Site em manutenção. Voltaremos em breve!'
  }
};

module.exports = fallbackData;

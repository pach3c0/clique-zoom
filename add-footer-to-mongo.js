const mongoose = require('mongoose');
require('dotenv').config();

const SiteData = require('./src/models/SiteData');

async function addFooter() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // Buscar documento existente
        let doc = await SiteData.findOne();
        
        if (!doc) {
            console.log('❌ Nenhum documento encontrado');
            process.exit(1);
        }

        console.log('📄 Documento atual:', {
            hasHero: !!doc.hero,
            hasAbout: !!doc.about,
            hasPortfolio: !!doc.portfolio,
            hasStudio: !!doc.studio,
            hasFooter: !!doc.footer
        });

        // Adicionar footer somente se não existir
        if (!doc.footer) {
            doc.footer = {
                socialMedia: {
                    instagram: '',
                    facebook: '',
                    linkedin: '',
                    tiktok: '',
                    youtube: '',
                    email: 'contato@cliquezoom.com.br'
                },
                quickLinks: [
                    { label: 'Início', url: '#hero' },
                    { label: 'Sobre', url: '#sobre' },
                    { label: 'Portfólio', url: '#portfolio' },
                    { label: 'Estúdio', url: '#estudio' }
                ],
                newsletter: {
                    enabled: true,
                    title: 'Receba Novidades',
                    description: 'Inscreva-se para atualizações e promoções exclusivas.'
                },
                copyright: '© 2026 CLIQUE·ZOOM. Todos os direitos reservados.'
            };

            await doc.save();
            console.log('✅ Footer adicionado com sucesso!');
        } else {
            console.log('ℹ️  Footer já existe no documento');
        }

        console.log('\n📊 Footer atual:', JSON.stringify(doc.footer, null, 2));
        
        await mongoose.disconnect();
        console.log('✅ Desconectado do MongoDB');
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

addFooter();

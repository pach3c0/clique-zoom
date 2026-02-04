const mongoose = require('mongoose');
require('dotenv').config();

const SiteData = require('./src/models/SiteData');

async function updateFooter() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        let doc = await SiteData.findOne();
        
        if (!doc) {
            console.log('❌ Nenhum documento encontrado');
            process.exit(1);
        }

        // Atualizar apenas se quickLinks estiver vazio
        if (!doc.footer.quickLinks || doc.footer.quickLinks.length === 0) {
            doc.footer.quickLinks = [
                { label: 'Início', url: '#hero' },
                { label: 'Sobre', url: '#sobre' },
                { label: 'Portfólio', url: '#portfolio' },
                { label: 'Estúdio', url: '#estudio' }
            ];
        }

        // Atualizar email se estiver vazio
        if (!doc.footer.socialMedia.email) {
            doc.footer.socialMedia.email = 'contato@cliquezoom.com.br';
        }

        doc.markModified('footer');
        await doc.save();
        
        console.log('✅ Footer atualizado com sucesso!');
        console.log('\n📊 Footer atualizado:', JSON.stringify(doc.footer, null, 2));
        
        await mongoose.disconnect();
        console.log('✅ Desconectado do MongoDB');
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateFooter();

const mongoose = require('mongoose');
require('dotenv').config();

const SiteData = require('./src/models/SiteData');

async function checkMongo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        const doc = await SiteData.findOne();
        
        if (!doc) {
            console.log('❌ Nenhum documento encontrado');
            process.exit(1);
        }

        console.log('\n📊 Documento no MongoDB:');
        console.log('Has hero:', !!doc.hero);
        console.log('Has about:', !!doc.about);
        console.log('Has studio:', !!doc.studio);
        console.log('Has footer:', !!doc.footer);
        console.log('Has portfolio:', !!doc.portfolio);
        
        console.log('\n🔍 Footer completo:');
        console.log(JSON.stringify(doc.footer, null, 2));
        
        console.log('\n🔍 Studio (primeiros campos):');
        console.log({
            title: doc.studio?.title,
            address: doc.studio?.address,
            whatsapp: doc.studio?.whatsapp
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

checkMongo();

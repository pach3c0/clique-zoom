const jwt = require('jsonwebtoken');

// Configuração - admin_password vem de .env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'clique-zoom-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

async function login(password) {
    try {
        console.log('🔐 Login attempt:', { 
          providedPassword: password,
          adminPassword: ADMIN_PASSWORD,
          match: password === ADMIN_PASSWORD
        });
        
        // Verificar se a senha corresponde
        // TODO: Em produção, usar bcryptjs para hash (instalar: npm install bcryptjs)
        if (password !== ADMIN_PASSWORD) {
            return { success: false, message: 'Senha incorreta' };
        }

        // Gerar JWT token
        const token = jwt.sign(
            { 
                admin: true, 
                timestamp: Date.now() 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return { 
            success: true, 
            token,
            expiresIn: JWT_EXPIRES_IN
        };
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: 'Erro no servidor' };
    }
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

module.exports = {
    login,
    verifyToken,
    JWT_SECRET
};

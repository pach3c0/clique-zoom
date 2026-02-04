const jwt = require('jsonwebtoken');

// Middleware para verificar JWT token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clique-zoom-secret-key');
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

module.exports = {
    verifyToken
};

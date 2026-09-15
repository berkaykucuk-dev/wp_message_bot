const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Yetkilendirme hatası: Token bulunamadı' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key');
        req.user = decoded; // token içinden id, role vb. bilgileri okuyoruz
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

module.exports = authMiddleware;

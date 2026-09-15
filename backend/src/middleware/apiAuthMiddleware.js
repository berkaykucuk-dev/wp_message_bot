const User = require('../models/User');

const apiAuthMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.header('x-api-key');

        if (!apiKey) {
            return res.status(401).json({ error: 'x-api-key header eksik.' });
        }

        const user = await User.findOne({ apiKey, isActive: true });

        if (!user) {
            return res.status(401).json({ error: 'Geçersiz veya pasif API Key.' });
        }

        // istek objesine kullanıcı detaylarını yapıştırıyoruz
        req.user = {
            id: user._id,
            role: user.role,
            metaConfig: user.metaConfig
        };

        next();
    } catch (error) {
        console.error('API Auth Middleware Hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

module.exports = apiAuthMiddleware;


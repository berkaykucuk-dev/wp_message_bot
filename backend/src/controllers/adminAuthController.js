const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const admin = await SuperAdmin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
        }
        
        if (!admin.isActive) {
            return res.status(403).json({ error: 'Hesabınız pasife alınmış.' });
        }
        
        const token = jwt.sign(
            { id: admin._id, role: 'superadmin' },
            process.env.JWT_SECRET || 'super_secret_jwt_key',
            { expiresIn: '12h' }
        );
        
        admin.lastLogin = new Date();
        await admin.save();
        
        res.json({
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'superadmin'
            }
        });
    } catch (error) {
        console.error('Superadmin login hatası:', error);
        res.status(500).json({ error: 'Giriş sırasında sunucu hatası.' });
    }
};


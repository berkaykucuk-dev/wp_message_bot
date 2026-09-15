const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email zaten kullanılıyor' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'manager'
        });
        
        await newUser.save();
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Geçersiz email veya şifre' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Geçersiz email veya şifre' });
        }
        
        const payload = {
            id: user._id,
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key', { expiresIn: '1d' });
        
        user.lastLogin = new Date();
        await user.save();
        
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Giriş hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

module.exports = { register, login };

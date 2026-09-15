const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        
        const settings = {
            accessToken: decrypt(user.metaConfig?.accessToken) || '',
            phoneNumberId: user.metaConfig?.phoneNumberId || '',
            wabaId: user.metaConfig?.wabaId || '',
            apiKey: user.apiKey || null
        };
        
        res.status(200).json({ settings });
    } catch (err) {
        console.error('Ayarları getirme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { accessToken, phoneNumberId, wabaId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        
        if (!user.metaConfig) {
            user.metaConfig = {};
        }
        
        if (accessToken !== undefined) {
            user.metaConfig.accessToken = encrypt(accessToken);
        }
        if (phoneNumberId !== undefined) {
            user.metaConfig.phoneNumberId = phoneNumberId;
        }
        if (wabaId !== undefined) {
            user.metaConfig.wabaId = wabaId;
        }
        
        await user.save();
        res.status(200).json({ message: 'Ayarlar başarıyla güncellendi' });
    } catch (err) {
        console.error('Ayarları güncelleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

const crypto = require('crypto');
const generateApiKey = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const apiKey = 'wa_' + crypto.randomBytes(32).toString('hex');
        user.apiKey = apiKey;
        await user.save();

        res.status(200).json({ apiKey, message: 'API Key oluşturuldu' });
    } catch (err) {
        console.error('API Key oluşturma hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

module.exports = { getSettings, updateSettings, generateApiKey };

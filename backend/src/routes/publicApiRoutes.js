const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const apiAuthMiddleware = require('../middleware/apiAuthMiddleware');
const campaignController = require('../controllers/campaignController'); // tekli mesaj atmak için ya kampanyayı kullanacağız ya da direkt basacağız

// 1. dışarıdan api ile yeni kişi ekliyoruz
router.post('/contacts', apiAuthMiddleware, async (req, res) => {
    try {
        const { name, phoneNumber, tags } = req.body;
        const userId = req.user.id;

        if (!name || !phoneNumber) {
            return res.status(400).json({ error: 'İsim ve telefon numarası zorunludur.' });
        }

        const { encrypt } = require('../utils/cryptoUtils');
        const encryptedPhone = encrypt(phoneNumber);

        const newContact = new Contact({
            userId,
            name,
            phoneNumber: encryptedPhone,
            tags: tags || ['API']
        });

        await newContact.save();
        res.status(201).json({ success: true, message: 'Kişi eklendi.', contactId: newContact._id });
    } catch (error) {
        console.error('Public API Contact Error:', error);
        res.status(500).json({ error: 'Kişi eklenemedi.' });
    }
});

// 2. api ile doğrudan kampanya ateşliyoruz
// req.body içeriği kampanya ile aynı bekliyoruz
// var olan kampanya methodunu kullandık çünkü çok temiz çalışıyor
router.post('/campaigns', apiAuthMiddleware, campaignController.createCampaign);

module.exports = router;


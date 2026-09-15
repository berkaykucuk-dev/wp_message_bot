const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Template = require('../models/Template');
const MessageLog = require('../models/MessageLog');
const User = require('../models/User');
const logger = require('../utils/logger');
const { enqueueMessage } = require('../services/queueService');

exports.createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, messageContent, targetTag, templateId, variableValues } = req.body;

        if (!name || (!messageContent && !templateId)) {
            return res.status(400).json({ error: 'Gerekli alanlar eksik.' });
        }

        const user = await User.findById(userId);
        if (!user || !user.metaConfig || !user.metaConfig.accessToken || !user.metaConfig.phoneNumberId || !user.metaConfig.wabaId) {
            return res.status(400).json({ error: 'Meta ayarlarınız yapılandırılmamış.' });
        }

        // hedef etikete sahip aktif kişileri çekiyoruz
        const targetContacts = await Contact.find({ userId, tags: targetTag, isActive: true });
        const totalContacts = targetContacts.length;

        if (totalContacts === 0) {
            return res.status(400).json({ error: 'Bu etikete sahip aktif kişi bulunamadı.' });
        }

        // kampanyayı db'ye yazıyoruz
        const campaign = new Campaign({
            userId,
            name,
            messageContent: messageContent || '',
            targetTag,
            templateId: templateId || null,
            variableValues: variableValues || null,
            status: 'Gönderiliyor',
            stats: { total: totalContacts, sent: 0, failed: 0 }
        });

        await campaign.save();
        res.status(201).json({ message: 'Kampanya başarıyla kuyruğa alındı.', campaign });

        // Kişileri kuyruğa ekle
        for (const contact of targetContacts) {
            await enqueueMessage({
                userId,
                campaignId: campaign._id,
                contact,
                messageContent: messageContent || '',
                templateId,
                variableValues,
                metaConfig: user.metaConfig
            });
        }
        
        // Asenkron olarak kampanya bitti işaretlemesi yapılamaz çünkü mesajlar kuyrukta.
        // İleride webhook veya queue olaylarıyla status: Tamamlandı yapılabilir. Şimdilik statik.

    } catch (error) {
        console.error('Kampanya oluşturma hatası:', error);
        res.status(500).json({ error: 'Kampanya oluşturulamadı.' });
    }
};

exports.getCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // en yeniler üstte kalacak şekilde listeliyoruz
        const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 }).lean();
        res.json(campaigns);
    } catch (error) {
        console.error('Kampanyaları getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};
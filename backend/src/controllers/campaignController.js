const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const MessageLog = require('../models/MessageLog');
const Template = require('../models/Template');
const User = require('../models/User');
const { decrypt } = require('../utils/cryptoUtils');
const logger = require('../utils/logger');

// whatsapp'a mesajları yolladığımız ana motor
const executeCampaign = async (userId, campaignId, contacts, messageContent, templateId, variableValues, metaConfig) => {
    const phoneId = metaConfig.phoneNumberId;
    const token = decrypt(metaConfig.accessToken);
    const apiUrl = `https://graph.facebook.com/v23.0/${phoneId}/messages`;
    
    let template = null;
    if (templateId) {
        template = await Template.findById(templateId);
    }

    for (const contact of contacts) {
        try {
            // db'den numarayı çözüyoruz
            let decryptedNumber = decrypt(contact.phoneNumber);
            
            // meta api numaraların başında + istemez, temizliyoruz
            const targetNumber = decryptedNumber.replace('+', '');

            // meta'ya yollanacak payload
            let payload;
            
            if (template && template.origin === 'meta') {
                payload = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: targetNumber,
                    type: 'template',
                    template: {
                        name: template.metaTemplateName,
                        language: { code: template.language },
                        components: []
                    }
                };
                
                const mediaUrl = variableValues._mediaUrl || template.headerContent;
                const hType = (template.headerType || '').toLowerCase();
                
                if (hType !== 'none' && hType !== '' && hType !== 'text') {
                    if (mediaUrl) {
                        payload.template.components.push({
                            type: 'header',
                            parameters: [{ type: hType, [hType]: { link: mediaUrl } }]
                        });
                    }
                }
                
                if (template.variables && template.variables.length > 0) {
                    const bodyParams = template.variables.map(v => ({
                        type: 'text',
                        text: variableValues[v] || ''
                    }));
                    payload.template.components.push({
                        type: 'body',
                        parameters: bodyParams
                    });
                }
            } else {
                let finalMessage = messageContent;
                
                if (template && (template.origin === 'local' || template.origin === 'system')) {
                    finalMessage = template.bodyText;
                    if (template.variables && variableValues) {
                        template.variables.forEach((v, index) => {
                            const val = variableValues[v] || '';
                            // süslü parantezli değişkenleri yakalayıp yerlerine değerlerini koyuyoruz
                            const pattern = new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g');
                            finalMessage = finalMessage.replace(pattern, val);
                        });
                    }
                }

                payload = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: targetNumber,
                    type: "text",
                    text: {
                        body: finalMessage
                    }
                };
            }

            // 4. API'ye İsteği At
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // sonuca göre db'yi güncelliyor ve logluyoruz
            if (response.ok && result.messages) {
                const wamid = result.messages[0].id; // Meta'nın verdiği benzersiz ID
                
                // başarılı gidişleri logluyoruz
                await MessageLog.create({
                    campaignId: campaignId,
                    contactId: contact._id,
                    status: 'sent',
                    metaMessageId: wamid
                });

                await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.sent': 1 } });
            } else {
                console.error(`[Meta API Hatası] ${targetNumber}:`, result.error?.message);
                await logger.logError(userId, 'META_API_ERROR', 'Meta API error occurred', { error: result.error?.message || result.error });
                
                // patlayanları logluyoruz
                await MessageLog.create({
                    campaignId: campaignId,
                    contactId: contact._id,
                    status: 'failed',
                    errorReason: result.error?.message
                });

                await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.failed': 1 } });
            }

        } catch (error) {
            console.error('Mesaj gönderim döngüsünde hata:', error.message);
            await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.failed': 1 } });
        }

        // spam yememek için araya yarım saniye mola koyuyoruz
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // her şey bittiyse kampanyayı tamamlandı işaretliyoruz
    await Campaign.findByIdAndUpdate(campaignId, { status: 'Tamamlandı' });
    console.log(`[Gerçek Gönderim] Kampanya ${campaignId} tamamlandı.`);
};

exports.createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, messageContent, targetTag, templateId, variableValues } = req.body;

        if (!name || (!messageContent && !templateId)) {
            return res.status(400).json({ error: 'Gerekli alanlar eksik.' });
        }

        const user = await User.findById(userId);
        if (!user || !user.metaConfig || !user.metaConfig.accessToken || !user.metaConfig.phoneNumberId || !user.metaConfig.wabaId) {
            return res.status(400).json({ error: 'Meta credentials not configured' });
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
            stats: { total: totalContacts, sent: 0, failed: 0 } // default istatistik değerleri
        });

        await campaign.save();
        res.status(201).json({ message: 'Kampanya başlatıldı.', campaign });

        executeCampaign(userId, campaign._id, targetContacts, messageContent || '', templateId, variableValues, user.metaConfig);

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
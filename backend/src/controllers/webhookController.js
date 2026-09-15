const MessageLog = require('../models/MessageLog');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

const VERIFY_TOKEN = 'te_bilisim_2026';

exports.verifyWebhook = (req, res) => {
    // meta'nın webhook'u ilk eklerken attığı güvenlik doğrulamasını karşılıyoruz
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('webhook başarıyla doğrulandı');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

exports.handleWebhook = async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            const changes = body.entry?.[0]?.changes?.[0]?.value;
            const metadata = changes?.metadata;
            const phoneNumberId = metadata?.phone_number_id;

            let user = null;
            if (phoneNumberId) {
                user = await User.findOne({ 'metaConfig.phoneNumberId': phoneNumberId });
            }

            // 1. senaryo: giden mesajların okundu/iletildi durumları
            if (changes?.statuses) {
                const statusObj = changes.statuses[0];
                const recipientId = statusObj.recipient_id;
                const status = statusObj.status; // 'sent', 'delivered', 'read', 'failed'
                const wamid = statusObj.id;

                const durumTr = status === 'sent' ? 'Gönderildi (Tek Tik)' :
                                status === 'delivered' ? 'İletildi (Çift Tik)' :
                                status === 'read' ? 'Okundu (Mavi Tik)' : 
                                status === 'failed' ? 'Hata / Başarısız' : status;

                console.log(`🟢 [Canlı Durum] Numarası: ${recipientId} -> ${durumTr} (User: ${user ? user.email : 'Unknown'})`);

                // bu mesajı wamid (meta id'si) ile buluyoruz
                const log = await MessageLog.findOne({ metaMessageId: wamid });

                // mesaj durumu eskisinden farklıysa işliyoruz ki meta'nın çifte yolladığı bildirimler patlamasın
                if (log && log.status !== status) {
                    log.status = status;
                    await log.save();

                    if (status === 'delivered' || status === 'read') {
                        const statField = `stats.${status}`;
                        await Campaign.findByIdAndUpdate(
                            log.campaignId,
                            { $inc: { [statField]: 1 } }
                        );
                    }
                }
            }

            // 2. senaryo: müşteriden yeni bir mesaj gelirse burası tetiklenir
            if (changes?.messages) {
                const msgObj = changes.messages[0];
                const senderPhone = msgObj.from;
                const msgText = msgObj.text?.body || '[Medya veya Farklı Format]';

                console.log(`💬 [Yeni Mesaj Geldi] Kimden: ${senderPhone} | Mesaj: "${msgText}" | User: ${user ? user.email : 'Unknown'}`);
                // ileride inbox modülü eklenirse burayı kullanabiliriz
            }

        } catch (error) {
            console.error('Webhook verisi işlenirken hata:', error);
        }
        
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
};
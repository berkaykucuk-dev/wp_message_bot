const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const Template = require('../models/Template');
const MessageLog = require('../models/MessageLog');
const Campaign = require('../models/Campaign');
const { decrypt } = require('../utils/cryptoUtils');
const logger = require('../utils/logger');

// Hız limitleyici (Rate Limiter)
// WhatsApp Cloud API'nin limitlerine takılmamak için
// Örn: saniyede max 50 mesaj (Burada güvenli limit koyalım: saniyede 10)
const workerOptions = {
    connection,
    limiter: {
        max: 10,
        duration: 1000 // 1 saniye içinde 10 iş
    }
};

const processJob = async (job) => {
    const { userId, campaignId, contact, messageContent, templateId, variableValues, metaConfig } = job.data;
    const phoneId = metaConfig.phoneNumberId;
    const token = decrypt(metaConfig.accessToken);
    const apiUrl = `https://graph.facebook.com/v23.0/${phoneId}/messages`;

    let template = null;
    if (templateId) {
        template = await Template.findById(templateId);
    }

    try {
        let decryptedNumber = decrypt(contact.phoneNumber);
        const targetNumber = decryptedNumber.replace('+', '');

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
            
            if (hType !== 'none' && hType !== '' && hType !== 'text' && mediaUrl) {
                payload.template.components.push({
                    type: 'header',
                    parameters: [{ type: hType, [hType]: { link: mediaUrl } }]
                });
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
                text: { body: finalMessage }
            };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.messages) {
            const wamid = result.messages[0].id;
            await MessageLog.create({
                campaignId: campaignId,
                contactId: contact._id,
                status: 'sent',
                metaMessageId: wamid
            });
            await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.sent': 1 } });
            return { success: true, wamid };
        } else {
            // Eğer Meta API rate limit veya başka bir hata verdiyse hatayı fırlat
            // Böylece BullMQ bunu başarısız sayıp Retry yapacak (Exponential Backoff)
            const errorMsg = result.error?.message || JSON.stringify(result);
            throw new Error(`Meta API Error: ${errorMsg}`);
        }
    } catch (error) {
        console.error(`Job [${job.id}] Failed:`, error.message);
        
        // Sadece deneme hakkı bittiğinde failed işaretliyoruz.
        // Worker içinde attemptsMade değerinden bunu anlayabiliriz.
        if (job.attemptsMade >= job.opts.attempts - 1) {
            await MessageLog.create({
                campaignId: campaignId,
                contactId: contact._id,
                status: 'failed',
                errorReason: error.message
            });
            await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.failed': 1 } });
        }
        throw error;
    }
};

const initWorker = () => {
    const worker = new Worker('whatsapp-message-queue', processJob, workerOptions);

    worker.on('completed', (job) => {
        // console.log(`Job ${job.id} tamamlandı.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`Job ${job.id} hata aldı: ${err.message}`);
    });

    console.log('✅ BullMQ Worker Başlatıldı: whatsapp-message-queue dinleniyor...');
    return worker;
};

module.exports = { initWorker };

const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis bağlantı ayarları
const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null // BullMQ için gerekli
};

const connection = new Redis(redisOptions);

// Kuyruğu oluştur
const messageQueue = new Queue('whatsapp-message-queue', { connection });

// Kuyruğa iş ekleme fonksiyonu
const enqueueMessage = async (jobData) => {
    // jobData = { userId, campaignId, contact, messageContent, templateId, variableValues, metaConfig }
    await messageQueue.add('send-message', jobData, {
        attempts: 3, // 3 kere tekrar dene
        backoff: {
            type: 'exponential',
            delay: 5000 // 5 saniye, 25 saniye, 125 saniye...
        },
        removeOnComplete: true, // Başarılıları redis'ten sil (şişmesin)
        removeOnFail: false // Hatalıları incelemek için tutabiliriz
    });
};

module.exports = {
    messageQueue,
    enqueueMessage,
    connection
};

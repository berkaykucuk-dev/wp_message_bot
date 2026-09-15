const SystemLog = require('../models/SystemLog');

const logger = {
    logInfo: async (userId, action, message, metaData = {}) => {
        try {
            await SystemLog.create({ userId, level: 'INFO', action, message, metaData });
        } catch (error) {
            console.error('Log kaydetme hatası (INFO):', error);
        }
    },
    logWarn: async (userId, action, message, metaData = {}) => {
        try {
            await SystemLog.create({ userId, level: 'WARN', action, message, metaData });
        } catch (error) {
            console.error('Log kaydetme hatası (WARN):', error);
        }
    },
    logError: async (userId, action, message, metaData = {}) => {
        try {
            await SystemLog.create({ userId, level: 'ERROR', action, message, metaData });
        } catch (error) {
            console.error('Log kaydetme hatası (ERROR):', error);
        }
    }
};

module.exports = logger;

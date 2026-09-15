const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    level: { type: String, enum: ['INFO', 'WARN', 'ERROR'], required: true, default: 'INFO' },
    action: { type: String, required: true },
    message: { type: String, required: true },
    metaData: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemLog', systemLogSchema);

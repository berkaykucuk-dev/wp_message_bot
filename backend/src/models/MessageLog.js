const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    status: { type: String, enum: ['queued', 'sent', 'delivered', 'read', 'failed'], default: 'queued' },
    errorReason: { type: String },
    metaMessageId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MessageLog', messageLogSchema);
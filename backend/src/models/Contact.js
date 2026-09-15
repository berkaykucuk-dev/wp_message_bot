const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, default: 'İsimsiz' },
    phoneNumber: { type: String, required: true, unique: true }, // cryptoutils ile şifrelendi, güvende
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    hasOptedOut: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'manager', 'editor'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    metaConfig: {
        accessToken: { type: String, default: null },
        phoneNumberId: { type: String, default: null },
        wabaId: { type: String, default: null }
    },
    apiKey: { type: String },
    lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
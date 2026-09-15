const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', superAdminSchema);


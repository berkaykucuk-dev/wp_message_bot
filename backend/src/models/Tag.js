const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#25D366' },
    count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
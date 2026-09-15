const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    metaTemplateName: { type: String, trim: true }, // meta şablon adı, genelde alt tireli ve küçük harfli oluyor
    category: { type: String, enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], default: 'MARKETING' },
    language: { type: String, default: 'tr' },
    status: { type: String, enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'APPROVED' },
    isDefault: { type: Boolean, default: false },
    headerType: { type: String, enum: ['none', 'text', 'image', 'video', 'document'], default: 'none' },
    headerContent: { type: String, default: '' },
    bodyText: { type: String, required: true },
    footerText: { type: String, default: '' },
    buttons: [{
        type: { type: String, enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'] },
        text: { type: String },
        url: { type: String },
        phoneNumber: { type: String }
    }],
    variables: [{ type: String }], // şablon içinde geçecek değişken isimleri
    origin: { type: String, enum: ['system', 'meta', 'local'], default: 'local' }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);

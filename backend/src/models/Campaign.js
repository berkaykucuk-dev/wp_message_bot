const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        // user modeline referans verdik
        required: true 
    },
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    messageContent: { 
        type: String, 
        required: true 
    },
    targetTag: { 
        type: String, 
        default: 'Rehber' // hangi tag'e sahip müşterilere yollayacağımızı seçiyoruz
    },
    status: { 
        type: String, 
        enum: ['Bekliyor', 'Gönderiliyor', 'Tamamlandı', 'İptal Edildi'], 
        default: 'Bekliyor' 
    },
    stats: {
        total: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 }, 
        read: { type: Number, default: 0 },      
        failed: { type: Number, default: 0 }
    },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', default: null },
    variableValues: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
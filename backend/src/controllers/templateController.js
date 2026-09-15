const Template = require('../models/Template');
const User = require('../models/User');
const { decrypt } = require('../utils/cryptoUtils');
const logger = require('../utils/logger');

exports.getTemplates = async (req, res) => {
    try {
        const userId = req.user.id;

        const templates = await Template.find({ userId })
            .sort({ createdAt: -1 });
        
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};

exports.createTemplate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, category, bodyText, headerType, headerContent, footerText, buttons, variables, language } = req.body;
        
        if (!name || !bodyText) {
            return res.status(400).json({ error: 'name and bodyText are required' });
        }

        const newTemplate = new Template({
            userId,
            name,
            category: category ? category.toUpperCase() : 'MARKETING',
            language: language || 'tr',
            bodyText,
            headerType: headerType ? headerType.toLowerCase() : 'none',
            headerContent,
            footerText,
            buttons,
            variables,
            isDefault: false,
            origin: 'local',
            status: 'APPROVED' // local şablonlar anında onaylı sayılıyor
        });

        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        console.error('Template creation error:', error);
        res.status(500).json({ error: 'Failed to create template', details: error.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findByIdAndDelete(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
};

exports.syncFromMeta = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || !user.metaConfig || !user.metaConfig.wabaId || !user.metaConfig.accessToken) {
            return res.status(400).json({ error: 'Meta credentials not configured' });
        }

        const wabaId = user.metaConfig.wabaId;
        const token = decrypt(user.metaConfig.accessToken);

        const apiUrl = `https://graph.facebook.com/v23.0/${wabaId}/message_templates`;
        
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('Meta API Error:', result);
            await logger.logError(userId, 'META_API_ERROR', 'Meta API error occurred', { error: result.error?.message || result.error });
            return res.status(400).json({ error: result.error?.message || 'Meta API hatası' });
        }

        let syncedCount = 0;

        for (const metaTpl of result.data) {
            // Sadece başarılı veya incelenenleri alalım (veya hepsini alıp statülerini güncelleyelim)
            let bodyText = '';
            let headerType = 'NONE';
            let headerContent = '';
            let footerText = '';
            let buttons = [];
            let variables = [];

            // Meta'nın komponentlerini ayrıştır
            for (const comp of metaTpl.components) {
                if (comp.type === 'BODY') {
                    bodyText = comp.text;
                    // {{1}}, {{2}} gibi değişkenleri bul (sadece sayısını veya benzersiz olanları)
                    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
                    if (matches) {
                        // Sadece kaç tane değişken olduğunu bul ve "değişken_1" gibi isimlendir
                        const uniqueVars = [...new Set(matches)];
                        variables = uniqueVars.map((v, i) => `degisken_${i+1}`);
                    }
                } else if (comp.type === 'HEADER') {
                    headerType = comp.format || 'NONE';
                    if (headerType === 'TEXT') headerContent = comp.text || '';
                } else if (comp.type === 'FOOTER') {
                    footerText = comp.text || '';
                } else if (comp.type === 'BUTTONS') {
                    buttons = comp.buttons.map(b => ({
                        type: b.type,
                        text: b.text,
                        url: b.url,
                        phoneNumber: b.phone_number
                    }));
                }
            }

            // DB'de ara, varsa güncelle, yoksa oluştur (metaTemplateName ve language kombinasyonuna göre)
            await Template.findOneAndUpdate(
                { userId, metaTemplateName: metaTpl.name, language: metaTpl.language },
                {
                    name: metaTpl.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    category: metaTpl.category,
                    status: metaTpl.status, // 'APPROVED', 'REJECTED', 'PENDING'
                    bodyText,
                    headerType,
                    headerContent,
                    footerText,
                    buttons,
                    variables,
                    isDefault: false,
                    origin: 'meta'
                },
                { upsert: true, new: true }
            );
            syncedCount++;
        }

        res.status(200).json({ message: `${syncedCount} şablon başarıyla senkronize edildi.` });
    } catch (error) {
        console.error('Senkronizasyon hatası:', error);
        res.status(500).json({ error: 'Senkronizasyon başarısız oldu.' });
    }
};

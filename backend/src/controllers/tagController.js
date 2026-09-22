const Tag = require('../models/Tag');
const Contact = require('../models/Contact');

exports.getTags = async (req, res) => {
    try {
        const userId = req.user.id;
        const tags = await Tag.find({ userId }).sort({ name: 1 });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

exports.createTag = async (req, res) => {
    try {
        const { name, color } = req.body;
        const userId = req.user.id;

        if (!name) return res.status(400).json({ error: 'Etiket adı gerekli.' });

        const existingTag = await Tag.findOne({ userId, name });
        if (existingTag) return res.status(400).json({ error: 'Bu etiket zaten mevcut.' });

        const newTag = await Tag.create({ userId, name, color: color || '#3B82F6' });
        res.status(201).json(newTag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;
        const userId = req.user.id;

        const tag = await Tag.findOne({ _id: id, userId });
        if (!tag) return res.status(404).json({ error: 'Etiket bulunamadı.' });

        const oldName = tag.name;
        tag.name = name || tag.name;
        if (color) tag.color = color;
        await tag.save();

        // Eğer etiket adı değiştiyse, Contact koleksiyonundaki etiket isimlerini de güncelle
        if (name && name !== oldName) {
            await Contact.updateMany(
                { userId, tags: oldName },
                { $set: { "tags.$": name } }
            );
        }

        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tag' });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const tag = await Tag.findOneAndDelete({ _id: id, userId });
        if (!tag) return res.status(404).json({ error: 'Etiket bulunamadı.' });

        // Etiketi tüm kişilerden temizle
        await Contact.updateMany(
            { userId },
            { $pull: { tags: tag.name } }
        );

        res.status(200).json({ message: 'Etiket silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
};

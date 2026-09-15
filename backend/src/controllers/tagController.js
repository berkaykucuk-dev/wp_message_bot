const Tag = require('../models/Tag');

exports.getTags = async (req, res) => {
    try {
        const userId = req.user.id;

        const tags = await Tag.find({ userId }).sort({ name: 1 });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

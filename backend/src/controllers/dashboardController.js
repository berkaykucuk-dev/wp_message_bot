const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalContacts = await Contact.countDocuments({ userId });
        const activeContacts = await Contact.countDocuments({ userId, isActive: true });

        const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 }).lean();
        
        const totalCampaigns = campaigns.length;
        let totalSent = 0;
        let totalFailed = 0;
        let totalDelivered = 0; 
        let totalRead = 0;      

        campaigns.forEach(campaign => {
            totalSent += campaign.stats.sent || 0;
            totalFailed += campaign.stats.failed || 0;
            totalDelivered += campaign.stats.delivered || 0; 
            totalRead += campaign.stats.read || 0;           
        });

        const recentCampaigns = campaigns.slice(0, 5);

        res.json({
            contacts: { total: totalContacts, active: activeContacts },
            campaigns: { 
                total: totalCampaigns, 
                sent: totalSent, 
                failed: totalFailed,
                delivered: totalDelivered, 
                read: totalRead            
            },
            recentCampaigns
        });

    } catch (error) {
        console.error('Dashboard veri çekme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};
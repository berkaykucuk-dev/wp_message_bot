const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const Contact = require('../models/Contact');
const SystemLog = require('../models/SystemLog');

// getStats(req, res): Return counts of total Users, Campaigns, and Templates in the database.
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();
        const totalTemplates = await Template.countDocuments();

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCampaigns,
                totalTemplates
            }
        });
    } catch (error) {
        console.error('getStats hatası:', error);
        res.status(500).json({ success: false, error: 'İstatistikler alınırken sunucu hatası oluştu.' });
    }
};

// getUsers(req, res): Return all users (exclude passwords and metaConfig tokens).
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -metaConfig.accessToken');
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('getUsers hatası:', error);
        res.status(500).json({ success: false, error: 'Kullanıcılar alınırken sunucu hatası oluştu.' });
    }
};

// toggleUserStatus(req, res): Accept a user ID in params, flip their isActive status, and save. Return updated user.
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
        }
        
        user.isActive = !user.isActive;
        await user.save();

        const updatedUser = await User.findById(id).select('-password -metaConfig.accessToken');
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('toggleUserStatus hatası:', error);
        res.status(500).json({ success: false, error: 'Kullanıcı durumu güncellenirken sunucu hatası oluştu.' });
    }
};

const streamLogger = require('../utils/streamLogger');
exports.getServerLogs = (req, res) => {
    // Return the in-memory array of logs
    res.json({ success: true, data: streamLogger.getLogs() });
};

// getUserDetails(req, res)
exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
        }
        
        const hasAccessToken = !!(user.metaConfig && user.metaConfig.accessToken);
        const hasWabaId = !!(user.metaConfig && user.metaConfig.wabaId);
        
        const metaSetup = {
            hasAccessToken,
            hasWabaId,
            phoneNumberId: user.metaConfig?.phoneNumberId || null,
            wabaId: user.metaConfig?.wabaId || null,
            appId: user.metaConfig?.appId || null,
        };

        const totalCampaigns = await Campaign.countDocuments({ userId: id });
        const totalTemplates = await Template.countDocuments({ userId: id });
        const totalContacts = await Contact.countDocuments({ userId: id });

        const recentCampaigns = await Campaign.find({ userId: id }).sort({ createdAt: -1 }).limit(5);

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    metaSetup
                },
                stats: {
                    totalCampaigns,
                    totalTemplates,
                    totalContacts
                },
                recentCampaigns
            }
        });
    } catch (error) {
        console.error('getUserDetails hatası:', error);
        res.status(500).json({ success: false, error: 'Kullanıcı detayları alınırken hata oluştu.' });
    }
};

// getSystemLogs(req, res)
exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await SystemLog.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('getSystemLogs hatası:', error);
        res.status(500).json({ success: false, error: 'Loglar alınırken hata oluştu.' });
    }
};

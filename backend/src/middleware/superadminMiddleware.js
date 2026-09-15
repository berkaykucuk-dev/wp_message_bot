const superadminMiddleware = (req, res, next) => {
    // burası çalışmadan önce auth middleware çalışıp kullanıcıyı getirmiş olmalı
    if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Erişim reddedildi. Superadmin yetkisi gereklidir.' 
        });
    }
    next();
};

module.exports = superadminMiddleware;

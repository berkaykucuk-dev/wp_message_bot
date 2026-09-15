const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const superadminMiddleware = require('../middleware/superadminMiddleware');

// admin rotalarına girmeden hem normal token hem de superadmin yetkisi soruyoruz
router.use(authMiddleware);
router.use(superadminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.get('/logs', adminController.getSystemLogs);
router.get('/server-logs', adminController.getServerLogs);

module.exports = router;

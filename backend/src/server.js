require('./utils/streamLogger').init();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const templateRoutes = require('./routes/templateRoutes');
const tagRoutes = require('./routes/tagRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const publicApiRoutes = require('./routes/publicApiRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { initWorker } = require('./workers/campaignWorker');

const app = express();

// ara katmanlarımızı (cors, json) buraya bağladık
app.use(cors());
app.use(express.json());

connectDB();
// Start BullMQ Worker
initWorker();

// api'mizin ana yolları (rotalar)
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// dışarıdan erişilebilecek açık apiler
app.use('/api/v1', publicApiRoutes);

app.use('/api/contacts', authMiddleware, contactRoutes);
app.use('/api/campaigns', authMiddleware, campaignRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/tags', authMiddleware, tagRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

app.use('/api/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend servisi ${PORT} portunda çalışıyor.`);
});
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Bağlandı: ${conn.connection.host}`);
        
        // Superadmin Seed Script
        const SuperAdmin = require('../models/SuperAdmin');
        const bcrypt = require('bcrypt'); 
        
        const superadminExists = await SuperAdmin.findOne({ email: 'admin@wa.com' });
        if (!superadminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await SuperAdmin.create({
                email: 'admin@wa.com',
                password: hashedPassword,
                name: 'Super Admin',
                isActive: true
            });
            console.log('Varsayılan superadmin oluşturuldu: admin@wa.com');
        }
    } catch (error) {
        console.error(`mongodb bağlantı hatası: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
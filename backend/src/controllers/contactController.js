const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

const Tag = require('../models/Tag');

exports.uploadContacts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Lütfen bir VCF dosyası yükleyin.' });
        }

        const userId = req.user.id;
        const fileContent = req.file.buffer.toString('utf-8');

        const validContacts = [];
        const invalidContacts = [];

        // VCF dosyasını her bir kişi kartına (BEGIN:VCARD) göre böler
        const vcards = fileContent.split(/BEGIN:VCARD/i);

        vcards.forEach(card => {
            if (!card.trim()) return; 

            // İsim ve Telefon satırlarını Regex ile yakala
            const fnMatch = card.match(/FN:(.*)/i);
            const telMatches = [...card.matchAll(/TEL.*:(.*)/gi)];

            const fullName = fnMatch ? fnMatch[1].trim() : 'İsimsiz';

            if (telMatches.length === 0) return;

            telMatches.forEach(match => {
                let rawNumber = match[1].trim();
                let number = rawNumber.replace(/[\s-()]/g, '');

                // Ülke kodu normalize işlemleri
                if (number.startsWith('05')) number = '+90' + number.substring(1);
                else if (number.startsWith('5') && number.length === 10) number = '+90' + number;
                else if (number.startsWith('90') && number.length === 12) number = '+' + number;

                if (number.startsWith('+90') && number.length === 13) {
                    validContacts.push({
                        userId,
                        fullName,
                        phoneNumber: encrypt(number), 
                        isActive: true,
                        tags: ['Rehber']
                    });
                } else {
                    invalidContacts.push({ fullName, originalNumber: rawNumber, reason: 'Geçersiz format' });
                }
            });
        });

        let insertedCount = 0;
        if (validContacts.length > 0) {
            try {
                const result = await Contact.insertMany(validContacts, { ordered: false });
                insertedCount = result.length;
                
                // Tag modelini senkronize et (Rehber etiketi varsa oluştur)
                await Tag.findOneAndUpdate(
                    { userId, name: 'Rehber' },
                    { $setOnInsert: { color: '#25D366' } },
                    { upsert: true }
                );
            } catch (dbErr) {
                // 11000 Duplicate Key (Mükerrer Kayıt) hatası olanlar hariç, başarıyla eklenenleri say
                insertedCount = dbErr.insertedDocs ? dbErr.insertedDocs.length : 0;
            }
        }

        res.json({
            summary: `${insertedCount} yeni numara kaydedildi, ${invalidContacts.length} hatalı format reddedildi.`,
            invalid_contacts: invalidContacts
        });

    } catch (error) {
        console.error('Kişi yükleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Alfabetik sıralama (A-Z) ve .lean() ile saf JSON formatında alma
        const contacts = await Contact.find({ userId }).sort({ fullName: 1 }).lean();

        // Frontend'e göndermeden önce numaraların şifresini çöz (Decryption)
        const decryptedContacts = contacts.map(contact => {
            try {
                contact.phoneNumber = decrypt(contact.phoneNumber);
            } catch (err) {
                console.error('Şifre çözme hatası:', err);
                contact.phoneNumber = "Şifreli Veri Okunamadı";
            }
            // Eğer VCF'ten tag gelmediyse varsayılan bir etiket ekle
            contact.tags = contact.tags && contact.tags.length > 0 ? contact.tags : ['Rehber'];
            return contact;
        });

        res.json(decryptedContacts);
    } catch (error) {
        console.error('Kişileri getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndDelete(id);
        res.json({ message: 'Kişi başarıyla silindi.' });
    } catch (error) {
        console.error('Kişi silme hatası:', error);
        res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, tags } = req.body;
        const userId = req.user.id;

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { fullName, tags },
            { new: true }
        );

        if (tags && tags.length > 0 && userId) {
            for (const tag of tags) {
                await Tag.findOneAndUpdate(
                    { userId, name: tag },
                    { $setOnInsert: { color: '#25D366', count: 0 } },
                    { upsert: true }
                );
            }
        }

        res.json({ message: 'Kişi başarıyla güncellendi.', contact: updatedContact });
    } catch (error) {
        console.error('Kişi güncelleme hatası:', error);
        res.status(500).json({ error: 'Güncelleme işlemi başarısız.' });
    }
};
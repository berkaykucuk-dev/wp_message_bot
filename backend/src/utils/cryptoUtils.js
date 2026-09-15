const crypto = require('crypto');

// şifrelememiz için 64 karakterli anahtarımız (sakın kaybetme)
const RAW_KEY = '2da4bf06995b8420f523e123067095ad8cc397a54c0f1d9b7636e5556248c334'; 
const ENCRYPTION_KEY = Buffer.from(RAW_KEY, 'hex'); // performansı artırmak için bir kere parse ediliyor
const IV_LENGTH = 16; 

function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Şifre çözme hatası:', error.message);
        return text; 
    }
}

module.exports = { encrypt, decrypt };
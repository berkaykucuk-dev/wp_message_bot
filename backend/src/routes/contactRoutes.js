const express = require('express');
const multer = require('multer');
const router = express.Router();
const contactController = require('../controllers/contactController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', contactController.getContacts);
router.post('/upload', upload.single('file'), contactController.uploadContacts);
router.put('/:id', contactController.updateContact); // numarayı güncellemek için rota
router.delete('/:id', contactController.deleteContact); // numarayı uçurmak için rota

module.exports = router;
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.post('/sync', templateController.syncFromMeta);
router.get('/', templateController.getTemplates);
router.post('/', templateController.createTemplate);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;

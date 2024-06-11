const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/getQuery', settingsController.getQuery);
router.post('/postQuery', settingsController.postQuery);

router.post('/saveSettings', settingsController.updateSettings);
router.get('/getSettings', settingsController.getSettings);
router.get('/getApiKey', settingsController.getApiKey);

module.exports = router;
const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

router.get('/session', sessionController.getSession);
router.post('/session', sessionController.updateSession);
router.post('/login', sessionController.login);
router.post('/logout', sessionController.logout);

module.exports = router;
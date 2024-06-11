const express = require('express');
const mediabrowserAPI = require('../controllers/fileController');

const router = express.Router();

router.get('/getFolderStructure', mediabrowserAPI.getFolderStructure);
router.post('/createFolder', mediabrowserAPI.createFolder);
router.post('/renameFolder', mediabrowserAPI.renameFolder);
router.post('/deleteFolder', mediabrowserAPI.deleteFolder);
router.post('/uploadVideo', mediabrowserAPI.uploadVideo);

module.exports = router;
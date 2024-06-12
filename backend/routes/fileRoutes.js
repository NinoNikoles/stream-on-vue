const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.get('/getFolderStructure', fileController.getFolderStructure);
router.post('/createFolder', fileController.createFolder);
router.post('/renameFolder', fileController.renameFolder);
router.post('/deleteFolder', fileController.deleteFolder);
router.post('/uploadVideo', fileController.uploadVideo);

module.exports = router;
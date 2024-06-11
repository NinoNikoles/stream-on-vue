const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/getAllUsers', userController.getAllUsers);
router.get('/getUser', userController.getUser);
router.post('/addUser', userController.addUser);
router.post('/editUser', userController.editUser);
router.post('/changeUserPassword', userController.changeUserPassword);
router.post('/deleteUser', userController.deleteUser);
router.post('/userIMGUpload', userController.userIMGUpload);
router.post('/updateUserImg', userController.updateUserImg);
router.get('/getUploadedUserImages', userController.getUploadedUserImages);
router.post('/deleteUploadedUserImage', userController.deleteUploadedUserImage);
router.post('/saveUserVolume', userController.saveUserVolume);

router.get('/getMediaWatched', userController.getMediaWatched);
router.post('/safeWatchTime', userController.safeWatchTime);
router.get('/getFromWatchlist', userController.getFromWatchlist);
router.get('/updateWatchlist', userController.updateWatchlist);

module.exports = router;
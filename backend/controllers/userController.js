const serverAPI = require('../serverAPI');

exports.getAllUsers = serverAPI.getAllUsers;
exports.getUser = serverAPI.getUser;
exports.addUser = serverAPI.addUser;
exports.editUser = serverAPI.editUser;
exports.changeUserPassword = serverAPI.changeUserPassword;
exports.deleteUser = serverAPI.deleteUser;
exports.userIMGUpload = serverAPI.userIMGUpload;
exports.updateUserImg = serverAPI.updateUserImg;
exports.getUploadedUserImages = serverAPI.getUploadedUserImages;
exports.deleteUploadedUserImage = serverAPI.deleteUploadedUserImage;
exports.saveUserVolume = serverAPI.saveUserVolume;

exports.getMediaWatched = serverAPI.getMediaWatched;
exports.safeWatchTime = serverAPI.safeWatchTime;
exports.getFromWatchlist = serverAPI.getFromWatchlist;
exports.updateWatchlist = serverAPI.updateWatchlist;
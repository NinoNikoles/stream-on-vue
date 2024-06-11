const serverAPI = require('../serverAPI');

exports.addMovie = serverAPI.addMovie;
exports.addShow = serverAPI.addShow;
exports.getMedia = serverAPI.getMedia;
exports.getMediaByInput = serverAPI.getMediaByInput;
exports.getMediaFiltered = serverAPI.getMediaFiltered;
exports.addVideoPathToMedia = serverAPI.addVideoPathToMedia;
exports.deleteShow = serverAPI.deleteShow;
exports.deleteSeason = serverAPI.deleteSeason;
exports.saveNewPoster = serverAPI.saveNewPoster;
exports.saveNewBackdrop = serverAPI.saveNewBackdrop;

exports.getSeasons = serverAPI.getSeasons;
exports.getEpisodes = serverAPI.getEpisodes;

exports.getEpisode = serverAPI.getEpisode;

exports.saveGenre = serverAPI.saveGenre;
exports.getGenre = serverAPI.getGenre;
exports.getGenreNameByID = serverAPI.getGenreNameByID;

exports.genreSlider = serverAPI.genreSlider;
exports.genreMovies = serverAPI.genreMovies;

exports.addHighlight = serverAPI.addHighlight;
exports.checkForHighlight = serverAPI.checkForHighlight;
exports.getAllHighlights = serverAPI.getAllHighlights;
exports.getHighlight = serverAPI.getHighlight;
exports.changeHighlightStatus = serverAPI.changeHighlightStatus;
exports.deleteHighlight = serverAPI.deleteHighlight;
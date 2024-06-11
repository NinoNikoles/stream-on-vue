const express = require('express');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

//-- Media
router.post('/movie', mediaController.addMovie);
router.post('/show', mediaController.addShow);
router.get('/media', mediaController.getMedia);
router.get('/mediaByInput', mediaController.getMediaByInput);
router.get('/mediaFiltered', mediaController.getMediaFiltered);
router.post('/addVideoPathToMedia', mediaController.addVideoPathToMedia);
router.post('/deleteShow', mediaController.deleteShow);
router.post('/deleteSeason', mediaController.deleteSeason);
router.post('/saveNewPoster', mediaController.saveNewPoster);
router.post('/saveNewBackdrop', mediaController.saveNewBackdrop);

//-- Seasons
router.get('/getSeasons', mediaController.getSeasons);
router.get('/getEpisodes', mediaController.getEpisodes);

//-- Episodes
router.get('/episode', mediaController.getEpisode);

//-- Genre
router.post('/saveGenre', mediaController.saveGenre);
router.get('/allGenre', mediaController.getGenre);
router.get('/genreNameByID', mediaController.getGenreNameByID);

//-- Genre Slider
router.get('/genreSlider', mediaController.genreSlider);
router.get('/genreMovies', mediaController.genreMovies);

//-- Highlights
router.post('/addHighlight', mediaController.addHighlight);
router.get('/checkForHighlight', mediaController.checkForHighlight);
router.get('/getAllHighlights', mediaController.getAllHighlights);
router.get('/getHighlight', mediaController.getHighlight);
router.post('/changeHighlightStatus', mediaController.changeHighlightStatus);
router.post('/deleteHighlight', mediaController.deleteHighlight);

module.exports = router;

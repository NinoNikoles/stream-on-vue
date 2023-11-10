const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const { dbSetup } = require('./js/db-setup');
const serverAPI = require('./js/serverAPI');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cors());
app.use(express.json());

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

// Connects / Init database
dbSetup();

// API-Endpunkt für Settings
app.post('/api/db/saveSettings', serverAPI.updateSettings);
app.get('/api/db/getSettings', serverAPI.getSettings);
app.get('/api/db/getApiKey', serverAPI.getApiKey);

// API-Endpunkt für Media
app.post('/api/db/movie', serverAPI.addMovie);
app.post('/api/db/show', serverAPI.addShow);
app.get('/api/db/media', serverAPI.getMedia);
app.get('/api/db/mediaFiltered', serverAPI.getMediaFiltered);

// API-Endpunkt für Genre
app.post('/api/db/saveGenre', serverAPI.saveGenre);
app.get('/api/db/allGenre', serverAPI.getGenre);
app.get('/api/db/genreNameByID', serverAPI.getGenreNameByID);

// Index Page Genre Slider
app.get('/api/db/genreSlider', serverAPI.genreSlider);
app.get('/api/db/genreMovies', serverAPI.genreMovies);

app.post('/api/db/addHighlight', serverAPI.addHighlight);
app.get('/api/db/checkForHighlight', serverAPI.checkForHighlight);
app.get('/api/db/getAllHighlights', serverAPI.getAllHighlights);
app.get('/api/db/getHighlight', serverAPI.getHighlight);
app.post('/api/db/changeHighlightStatus', serverAPI.changeHighlightStatus);
app.post('/api/db/deleteHighlight', serverAPI.deleteHighlight);


app.listen(PORT, () => {
    console.log(`Server gestartet auf Port ${PORT}`);
});

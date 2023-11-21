const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
    secret: 'hh830476c753416c76xn915xnm76c4765',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 604800000,
    }
}));
app.use(bodyParser.json());

const { dbSetup } = require('./js/db-setup');
const serverAPI = require('./js/serverAPI');

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

// API-Endpunkt für User
app.get('/api/db/session', serverAPI.getSession);
app.post('/api/db/login', serverAPI.login);
app.post('/api/db/logout', serverAPI.logout);

// API-Endpunkt für Media
app.post('/api/db/movie', serverAPI.addMovie);
app.post('/api/db/show', serverAPI.addShow);
app.get('/api/db/media', serverAPI.getMedia);
app.get('/api/db/mediaByInput', serverAPI.getMediaByInput);
app.get('/api/db/mediaFiltered', serverAPI.getMediaFiltered);

// API-Endpunkt für Seasons
app.get('/api/db/getSeasons', serverAPI.getSeasons);
app.get('/api/db/getEpisodes', serverAPI.getEpisodes);

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

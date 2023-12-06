const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();

const corsOptions = {
    origin: true,
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
const mediabrowserAPI = require('./js/mediabrowserAPI');

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

// Connects / Init database
dbSetup();

//-- Settings
app.post('/api/db/saveSettings', serverAPI.updateSettings);
app.get('/api/db/getSettings', serverAPI.getSettings);
app.get('/api/db/getApiKey', serverAPI.getApiKey);

//-- Session
app.get('/api/db/session', serverAPI.getSession);
app.post('/api/db/login', serverAPI.login);
app.post('/api/db/logout', serverAPI.logout);

//-- Media
app.post('/api/db/movie', serverAPI.addMovie);
app.post('/api/db/show', serverAPI.addShow);
app.get('/api/db/media', serverAPI.getMedia);
app.get('/api/db/mediaByInput', serverAPI.getMediaByInput);
app.get('/api/db/mediaFiltered', serverAPI.getMediaFiltered);
app.post('/api/db/addVideoPathToMedia', serverAPI.addVideoPathToMedia);

//--r Seasons
app.get('/api/db/getSeasons', serverAPI.getSeasons);
app.get('/api/db/getEpisodes', serverAPI.getEpisodes);

//-- Genre
app.post('/api/db/saveGenre', serverAPI.saveGenre);
app.get('/api/db/allGenre', serverAPI.getGenre);
app.get('/api/db/genreNameByID', serverAPI.getGenreNameByID);

//-- Genre Slider
app.get('/api/db/genreSlider', serverAPI.genreSlider);
app.get('/api/db/genreMovies', serverAPI.genreMovies);

//-- Highlights
app.post('/api/db/addHighlight', serverAPI.addHighlight);
app.get('/api/db/checkForHighlight', serverAPI.checkForHighlight);
app.get('/api/db/getAllHighlights', serverAPI.getAllHighlights);
app.get('/api/db/getHighlight', serverAPI.getHighlight);
app.post('/api/db/changeHighlightStatus', serverAPI.changeHighlightStatus);
app.post('/api/db/deleteHighlight', serverAPI.deleteHighlight);

//-- Users
app.get('/api/db/getAllUsers', serverAPI.getAllUsers);
app.get('/api/db/getUser', serverAPI.getUser);
app.post('/api/db/addUser', serverAPI.addUser);
app.post('/api/db/editUser', serverAPI.editUser);
app.post('/api/db/changeUserPassword', serverAPI.changeUserPassword);
app.post('/api/db/deleteUser', serverAPI.deleteUser);
app.post('/userIMGUpload', serverAPI.userIMGUpload);
app.post('/api/db/updateUserImg', serverAPI.updateUserImg);
app.get('/api/db/getUploadedUserImages', serverAPI.getUploadedUserImages);
app.post('/api/db/deleteUploadedUserImage', serverAPI.deleteUploadedUserImage);

//// -- Media browser -- ////
app.get('/getFolderStructure', mediabrowserAPI.getFolderStructure);
app.post('/createFolder', mediabrowserAPI.createFolder);
app.post('/renameFolder', mediabrowserAPI.renameFolder);
app.post('/deleteFolder', mediabrowserAPI.deleteFolder);
app.post('/uploadVideo', mediabrowserAPI.uploadVideo);


const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(3000, () => {
    console.log(`Server is listening on port ${port}`);
});

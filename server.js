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
app.use(express.static(
    '/build', {
        type: 'text/css',
        type: 'application/javascript',
    }
));
app.use(express.json({ limit: '10000mb'}));
app.use(session({
    secret: 'hh830476c753416c76xn915xnm76c4765',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 604800000,
    }
}));
app.use(bodyParser.json());

const { dbSetup } = require('./backend/db-setup');
const serverAPI = require('./backend/serverAPI');
const mediabrowserAPI = require('./backend/mediabrowserAPI');

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

// Connects / Init database
dbSetup();

app.get('/api/db/getQuery', serverAPI.getQuery);

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
app.post('/api/db/deleteShow', serverAPI.deleteShow);
app.post('/api/db/deleteSeason', serverAPI.deleteSeason);
app.post('/api/db/saveNewPoster', serverAPI.saveNewPoster);
app.post('/api/db/saveNewBackdrop', serverAPI.saveNewBackdrop);

//-- Seasons
app.get('/api/db/getSeasons', serverAPI.getSeasons);
app.get('/api/db/getEpisodes', serverAPI.getEpisodes);

//-- Episodes
app.get('/api/db/episode', serverAPI.getEpisode);

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
app.post('/api/db/saveUserVolume', serverAPI.saveUserVolume);

app.get('/api/db/getMediaWatched', serverAPI.getMediaWatched);
app.post('/api/db/safeWatchTime', serverAPI.safeWatchTime);
app.get('/api/db/getFromWatchlist', serverAPI.getFromWatchlist);
app.get('/api/db/updateWatchlist', serverAPI.updateWatchlist);

//// -- Media browser -- ////
app.get('/getFolderStructure', mediabrowserAPI.getFolderStructure);
app.post('/createFolder', mediabrowserAPI.createFolder);
app.post('/renameFolder', mediabrowserAPI.renameFolder);
app.post('/deleteFolder', mediabrowserAPI.deleteFolder);
app.post('/uploadVideo', mediabrowserAPI.uploadVideo);


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = {};

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    const remotesessionID = urlParams.get('remotesessionID');

    // Füge den WebSocket-Client zur Liste der Clients für diese remotesessionID hinzu
    if (!clients[remotesessionID]) {
        clients[remotesessionID] = [];
    }
    clients[remotesessionID].push(ws);

    ws.on('message', (message) => {
        // Hier empfängst du Nachrichten von einem Benutzer und sendest sie an alle anderen Benutzer
        clients[remotesessionID].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        // Entferne den WebSocket-Client aus der Liste, wenn die Verbindung geschlossen wird
        const index = clients[remotesessionID].indexOf(ws);
        if (index !== -1) {
            clients[remotesessionID].splice(index, 1);
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(3000, () => {
    console.log(`Server is listening on port ${port}`);
});

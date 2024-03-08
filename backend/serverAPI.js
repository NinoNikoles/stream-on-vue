const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = new sqlite3.Database('./database.db');

const getSession = (req, res) => {
    const sessionData = req.session;
    res.json(sessionData);
}

function loginFunction(username, password, request) {
    return new Promise((resolve, reject) => {
        // Finde den Benutzer in der Datenbank
        db.all("SELECT * FROM users WHERE username = ?", username, (err, user) => {
            if (user[0]) {
                // Vergleiche das eingegebene Passwort mit dem gehashten Passwort
                bcrypt.compare(password, user[0].password, (err, result) => {
                    if (result) {
                        request.session.user = {
                            id: user[0].id,
                            name: user[0].username,
                            role: user[0].role,
                            isLoggedIn: true
                        }
                        request.session.save();
                        //res.json({message: 'login successful'});
                        resolve(this);
                    } else {
                        // Falsches Passwort
                        err = 'invalid_password';
                        reject(err);
                    }
                });
            } else {
                // Benutzer nicht gefunden
                err = 'user_not_found';
                reject(err);
            }
        });
    });
}

function getQueryFunction(query) {
    return new Promise((resolve, reject) => {
        // Finde den Benutzer in der Datenbank
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
const getQuery = async(req, res) => {
    const { query, like } = req.query;
    let queryString = query;

    if (like) {
        queryString = queryString.replace(/\$\$\$\$/g, `LIKE '%${like}%'`);
    }

    try {
        var response = await getQueryFunction(queryString);
        res.json(response);
    } catch(err) {
        res.status(500).send({message: err});
    }
}

//-- Login --
const login = async(req, res) => {
    const { username, password } = req.body;

    try {
        await loginFunction(username, password, req);
        res.json('Login');
    } catch(err) {
        console.log(err);
        res.status(500).send({message: err});
    }
}

const logout = (req, res) => {
    const { username, role } = req.body;

    req.session.user = {
        name: username,
        role: role,
        isLoggedIn: false
    }
    req.session.save();
    res.json({message: 'logout_successful'});
}

// Settings
const getSettings = (req, res) => {
    let query = `SELECT * FROM settings`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getApiKey = (req, res) => {
    let query = `SELECT setting_option FROM settings WHERE setting_name="api_key"`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const updateSettings = (req, res) => {
    const updateData = req.body;
    const { fields, whereClause } = req.query;

    const [key, value ] = Object.entries(updateData)[0];

    const columns = fields.split(',').map(column => column.trim());
    const placeholders = columns.map(column => `${column} = ${value}`).join(', ');

    const sql = `UPDATE settings SET ${placeholders} WHERE ${whereClause}`;

    db.run(sql, (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to add data.' });
        } else {
            res.json({ message: 'Data added successfully!', key: value });
        }
    });
};

// Media
const getMedia = (req, res) => {
    const { whereClause } = req.query;
    const { orderBy, order, userID } = req.query;
    let query = ``;

    if ( userID ) {
        query += `SELECT * FROM watchlist JOIN media ON watchlist.media_id = media.tmdbID WHERE watchlist.user_id = ?`;

        if (whereClause) query += ` AND ${whereClause}`;
    } else {
        query += `SELECT * FROM media`;

        if (whereClause) query += ` WHERE ${whereClause}`;
    }  

    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (order) query += ` ${order}`;

    db.all(query, [userID], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getMediaByInput = (req, res) => {
    const { input, orderBy, order } = req.query;

    let query = `SELECT * FROM media`;

    query += ` WHERE title LIKE '%${input}%'`;

    if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
    }

    if (order) {
        query += ` ${order}`;
    }
    console.log(query);
    db.all(query, [], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const addMovie = (req, res) => {
    const { media } = req.body;
 
    const { mediaID, dataGenres } = req.query;
    const columns = Object.keys(media).join(', ');
    const placeholders = Object.keys(media).map(() => '?').join(', ');
    const values = Object.values(media);

    const genres = JSON.parse(dataGenres);


    db.run(`INSERT INTO media (${columns}) VALUES (${placeholders})`, values, function(err) {
        if (err) {
            console.error(`Error - Failed to add data: `, err.message);
            res.status(500).json({ error: 'Failed to add data.' });
        } else {
            console.log(`Data added successfully - Media`);
            
            for (const genre of genres) {
                db.run(`INSERT INTO media_genre (media_id, genre_id) VALUES(?, ?)`, [mediaID, genre], (err) => {
                    if (err) {
                        console.error(`Error - Failed to add genre: `, err.message);
                    } else {
                        console.log(`Data added successfully - Genre`);
                    }
                });
            }

            res.json({ message: true });
        }
    });
};

const addShow = (req, res) => {
    const { media, seasons, episodes } = req.body;
 
    const { mediaID, dataGenres } = req.query;
    const columns = Object.keys(media).join(', ');
    const placeholders = Object.keys(media).map(() => '?').join(', ');
    const values = Object.values(media);

    const genres = JSON.parse(dataGenres);

    db.run(`INSERT INTO media (${columns}) VALUES (${placeholders})`, values, async function(err) {
        if (err) {
            console.error(`Error - Failed to add data: `, err.message);
            res.status(500).json({ error: 'Failed to add data.' });
        } else {
            console.log(`Data added successfully - Media`);
            try {
                for (const genre of genres) {
                    await sendGenre(mediaID, genre);
                    console.log(`Data added successfully - Genre`);
                }

                for (const season of seasons) {
                    await sendSeason(season);
                    console.log(`Data added successfully - Season`);
                }

                for (const episode of episodes) {
                    await sendEpisode(episode);
                    console.log(`Data added successfully - Episode`);
                }

                res.json({ message: true });
            } catch (err) {
                console.log(err);
            }
        }
    });
};

const getMediaFiltered = (req, res) => {
    const { mediaType, orderBy, order, genreID, userID } = req.query;
    let query = `SELECT * FROM media`;
    
    if (genreID) query += ` JOIN media_genre ON media.tmdbID = media_genre.media_id`;
    if (userID)  query += ` JOIN watchlist ON media.tmdbID = watchlist.media_id`;

    query += ` WHERE`;

    var i = 0;
    if (genreID) { query += ` media_genre.genre_id = ${genreID}`; i++; }
    if (mediaType) {
        if ( i > 0) query += ` AND`;
        query += ` media.media_type = "${mediaType}"`;
        i++;
    }
    if (userID) {
        if ( i > 0) query += ` AND`;
        query += ` watchlist.user_id = ${userID}`;
    }

    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (order) query += ` ${order}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const addVideoPathToMedia = (req, res) => {
    const { mediaType, mediaID, videoPath } = req.body.params;

    let query = `UPDATE ${mediaType} SET file_path = ? WHERE tmdbID = ?`;
    
    db.all(query, [`${videoPath}`, mediaID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json('Success');
    });
}

const saveNewPoster = (req, res) => {
    const { mediaID, poster } = req.query;

    let query = `UPDATE media SET poster = ? WHERE tmdbID = ?`;
    
    db.all(query, [`${poster}`, mediaID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json('Success');
    });
}

const saveNewBackdrop = (req, res) => {
    const { mediaID, backdrop } = req.query;

    let query = `UPDATE media SET backdrop = ? WHERE tmdbID = ?`;
    
    db.all(query, [`${backdrop}`, mediaID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json('Success');
    });
}

//-- Seasons --
const getSeasons = (req, res) => {
    const { showID } = req.query;
    let query = `SELECT * FROM seasons WHERE show_tmdbID = ${showID} ORDER BY season_number ASC`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return;
        }
        res.json(rows);
    });
}

//-- Episodes --
const getEpisodes = (req, res) => {
    const { showID } = req.query;
    let query = `SELECT * FROM episodes WHERE show_id = ${showID} ORDER BY season_number, episode_number ASC`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return;
        }
        res.json(rows);
    });
}

const getEpisode = (req, res) => {
    const { tmdbID } = req.query;

    let query = `SELECT * FROM episodes  WHERE tmdbID = ${tmdbID}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

// Genre
const saveGenre = (req, res) => {
    const { genres } = req.body;
    const placeholders = genres.map(genre => "(?, ?)").join(', ');
    const values = genres.flatMap(genre => [genre.id, genre.name]);
    
    db.run(`INSERT INTO genre (genre_id, genre_name) VALUES ${placeholders}`, values, (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to add data.' });
        } else {
            res.json(true);
        }
    });
};

const getGenre = (req, res) => {
    let query = `SELECT * FROM genre`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}
function getGenreNameByIDFunktion(id) {
    return new Promise((resolve, reject) => {
        // Finde den Benutzer in der Datenbank
        db.all("SELECT genre_name FROM genre WHERE genre_ID = ?", id, (err, row) => {
            if (row) {
                resolve(row);
            } else {
                // Benutzer nicht gefunden
                err = 'user_not_found';
                reject(err);
            }
        });
    });
}

const getGenreNameByID = async (req, res) => {
    const { id } = req.query;

    try {
        var response = await getGenreNameByIDFunktion(id);
        res.json(response);
    } catch(err) {
        res.status(500).send({message: err});
    }
}

function sendSeason(season) {
    return new Promise((resolve, reject) => {
        const columns = Object.keys(season).join(', ');
        const placeholders = Object.keys(season).map(() => '?').join(', ');
        const values = Object.values(season);

        db.run(`INSERT INTO seasons (${columns}) VALUES (${placeholders})`, values, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

function sendEpisode(episode) {
    return new Promise((resolve, reject) => {
        const columns = Object.keys(episode).join(', ');
        const placeholders = Object.keys(episode).map(() => '?').join(', ');
        const values = Object.values(episode);

        db.run(`INSERT INTO episodes (${columns}) VALUES (${placeholders})`, values, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

function sendGenre(mediaID, genre) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO media_genre (media_id, genre_id) VALUES(?, ?)`, [mediaID, genre], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

// Deleting Media Data
const deleteMovie = async (req, res) => {
    const { mediaID } = req.query;

    try {
        await deleteFromAllWatchLists(mediaID);
        await deleteFromHighlights(mediaID);
        await deleteMediaGenre(mediaID);
        await deleteMediaComplete(mediaID);

        res.json('Done');
    } catch(err) {
        console.log(err);
    }
}

const deleteShow = async (req, res) => {
    const { mediaID } = req.query;

    try {
        await deleteFromAllWatchLists(mediaID);
        await deleteFromHighlights(mediaID);
        await deleteAllEpisodes(mediaID);
        await deleteAllSeasons(mediaID);
        await deleteMediaGenre(mediaID);
        await deleteMediaComplete(mediaID);

        res.json('Done');
    } catch(err) {
        console.log(err);
    }
}

const deleteSeason = async (req, res) => {
    const { mediaID, seasonNumber } = req.query;

    try {
        await deleteAllEpisodesFromSeason(mediaID, seasonNumber);
        await deleteSingleSeason(mediaID, seasonNumber);
        res.json('Done');
    } catch(err) {
        console.log(err);
    }
}

function deleteMediaComplete(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM media WHERE tmdbID = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Media deleted.');
                resolve(this);
            }
        });
    });
}

function deleteMediaGenre(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM media_genre WHERE media_id = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Genre deleted.');
                resolve(this);
            }
        });
    });
}

function deleteAllSeasons(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM seasons WHERE show_tmdbID = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Seasons deleted.');
                resolve(this);
            }
        });
    });
}

function deleteSingleSeason(mediaID, seasonNumber) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM seasons WHERE show_tmdbID = ? AND season_number = ?`, [mediaID, seasonNumber], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Season deleted.');
                resolve(this);
            }
        });
    });
}

function deleteAllEpisodes(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM episodes WHERE show_id = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Episodes deleted.');
                resolve(this);
            }
        });
    });
}

function deleteAllEpisodesFromSeason(mediaID, seasonNumber) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM episodes WHERE show_id = ? AND season_number = ?`, [mediaID, seasonNumber], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Episodes deleted.');
                resolve(this);
            }
        });
    });
}

function deleteFromHighlights(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM highlights WHERE highlight_id = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Deleted from Highlights.');
                resolve(this);
            }
        });
    });
}

function deleteFromAllWatchLists(mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM watchlist WHERE media_id = ?`, [mediaID], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Deleted from Watchlists.');
                resolve(this);
            }
        });
    });
}

const genreSlider = (req, res) => {
    let query = `SELECT DISTINCT genre.genre_id, genre.genre_name
    FROM genre
    WHERE genre.genre_id IN (
        SELECT DISTINCT media_genre.genre_id
        FROM media_genre
    )`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const genreMovies = (req, res) => {
    const { genreID } = req.query;

    let query = `SELECT tmdbID
    FROM media
    INNER JOIN media_genre ON media.tmdbID = media_genre.media_id
    WHERE media_genre.genre_id = ${genreID}
    ORDER BY RANDOM()
    LIMIT 20;`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

//-- Highlight --
const checkForHighlight = (req, res) => {
    const { mediaID } = req.query;
    let query = `SELECT id FROM highlights WHERE highlight_id = ${mediaID}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const addHighlight = (req, res) => {
    const { mediaID } = req.query;
    let query = `INSERT OR REPLACE INTO highlights(highlight_id, highlight_status) 
    VALUES (${mediaID}, 1)`;

    db.run(query, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(true);
    });
}

const getAllHighlights = (req, res) => {
    let query = `SELECT highlights.highlight_id, highlights.highlight_status, media.title, media.backdrop
    FROM highlights
    INNER JOIN media ON highlights.highlight_id = media.tmdbID`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getHighlight = (req, res) => {
    let query = `SELECT highlights.highlight_id, media.title, media.overview, media.poster, media.backdrop, media.media_type, media.trailer
    FROM highlights 
    INNER JOIN media ON highlights.highlight_id = media.tmdbID
    WHERE highlights.highlight_status = 1
    ORDER BY RANDOM()
    LIMIT 1`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const changeHighlightStatus = (req, res) => {
    const { id, status } = req.query;
    let query = `UPDATE highlights SET highlight_status=${status} WHERE highlight_id=${id}`;

    db.run(query, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
    });
}

const deleteHighlight = (req, res) => {
    const { id } = req.query;
    let query = `DELETE FROM highlights WHERE highlight_id=${id}`;

    db.all(query, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(true);
    });
}


//-- Users --
const getAllUsers = (req, res) => {
    let query = `SELECT * FROM users`;

    db.all(query, [], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getUser = (req, res) => {
    const { userID } = req.query;

    let query = `SELECT * FROM users WHERE id = ?`;

    db.all(query,  [userID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const addUser = (req, res) => {
    const { username, password, role } = req.query;

    let query = `INSERT INTO users 
    (username, password, role, user_img) VALUES (?, ?, ?, ?)`;

    const hashed_password = bcrypt.hashSync(password, saltRounds);
    var stringRole = 'user';
    if ( role ===  'true' || role ===  true ) stringRole = 'admin';
    const img = '/media/avatar.webp';

    db.all(query,  [username, hashed_password, stringRole, img], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const editUser = (req, res) => {
    const { userID, username, role } = req.query;

    let query = `UPDATE users SET username = ?, role = ? WHERE id = ?`;

    var stringRole = 'user';
    if ( role ===  'true' || role ===  true ) stringRole = 'admin';

    db.all(query, [username, stringRole, userID], (err) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.send();
    });
}

const changeUserPassword = (req, res) => {
    const { userID, password } = req.query;
    const hashed_password = bcrypt.hashSync(password, saltRounds);

    let query = `UPDATE users SET password = ? WHERE id = ?`;
    db.all(query, [hashed_password, userID], (err) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.send();
    });
}

const deleteUser = (req, res) => {
    const { userID } = req.query;

    let query = `DELETE FROM users WHERE id = ${userID}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            // res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const userIMGUpload = (req, res) => {
    const { userID } = req.query;

    function createUserFolder(userID) {
        const userFolder = path.join(__dirname, '../public/media/user_uploads');
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }
    
        const userUploadFolder = path.join(userFolder, userID);
        if (!fs.existsSync(userUploadFolder)) {
            fs.mkdirSync(userUploadFolder);
        }

        return userUploadFolder;
    }

    // Funktion zum Umbenennen der Datei bei Konflikt
    const resolveFileNameConflict = (folder, fileName) => {
        let index = 1;
        let newFileName = fileName;
        const fileBase = path.parse(fileName).name;
        const fileExt = path.parse(fileName).ext;
    
        while (fs.existsSync(path.join(folder, newFileName))) {
            newFileName = `${fileBase}_${index}${fileExt}`;
            index++;
        }
    
        return newFileName;
    };

    // Konfiguration für Multer (Dateiupload)
    const storage = multer.diskStorage({
        destination: function (_, file, cb) {
            const userUploadFolder = createUserFolder(userID);
            cb(null, userUploadFolder);
        },
        filename: function (_, file, cb) {
            const userUploadFolder = createUserFolder(userID);
            const resolvedFileName = resolveFileNameConflict(userUploadFolder, file.originalname);
            cb(null, resolvedFileName);
        },
    });

    const upload = multer({ storage: storage }).single('file');

    // Dateiupload durchführen
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Datei erfolgreich hochgeladen.');
    });
}

const updateUserImg = (req, res) => {
    const { userID, img } = req.query;

    let query = `UPDATE users SET img = ? WHERE id = ?`;

    db.all(query, [img, userID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getUploadedUserImages = (req, res) => {
    const { userID } = req.query;

    const userFolder = path.join(__dirname, '../public/media/user_uploads');
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
    }

    const imagesFolder = path.join(userFolder, `${userID}`);
    if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder);
    }

    try {
        // Lies den Inhalt des 'images'-Ordners
        fs.readdir(imagesFolder, (err, files) => {
            if (err) {
                console.error('Fehler beim Lesen des Bilderordners:', err);
                res.status(500).json({ error: 'Interner Serverfehler' });
                return;
            }

            // Filtere nur Dateien mit unterstützten Bildformaten (z.B., jpg, png)
            const imagePaths = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
            // Erstelle die Bildinformationen
            const imageList = imagePaths.map((file, index) => {
                const filePath = path.join(imagesFolder, file);
                const stats = fs.statSync(filePath);
                return {
                    path: file,
                    date: stats.mtime // Änderungsdatum der Datei
                };
            });

            imageList.sort((a, b) => b.date - a.date);

            // Sende die Bildinformationen als JSON zurück
            console.log(imageList);
            res.json(imageList);
        });
    } catch (error) {
        console.error('Fehler beim Lesen des Bilderordners:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

const deleteUploadedUserImage = (req, res) => {
    const { img, userID } = req.query; // Du könntest dies auch aus dem Anfragekörper (req.body) extrahieren

    const imagePath = path.join(__dirname, `../public/media/user_uploads/${userID}/${img}`);

    try {
        // Überprüfe, ob die Datei existiert
        if (fs.existsSync(imagePath)) {
            // Lösche die Datei
            fs.unlinkSync(imagePath);
            res.json({ message: 'Bild erfolgreich gelöscht.' });
        } else {
            res.status(404).json({ error: 'Bild nicht gefunden.' });
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Bildes:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
};

const getMediaWatched = (req, res) => {
    const { mediaID, userID } = req.query;

    let query = `SELECT * FROM media_watched WHERE user_id = ? AND media_id = ?`;

    db.get(query, [userID, mediaID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const safeWatchTime = (req, res) => {
    const {
        userID,
        mediaID,
        nextMediaID,
        showID,
        currentTime,
        nextTime,
        watched,
        nextWatched,
        totalLength,
        nextTotalLength
    } = req.body;

    var currentDate = new Date();
    var formattetDate = currentDate.toISOString();

    let query = `INSERT OR REPLACE INTO media_watched(user_id, media_id, show_id, watched_seconds, total_length, watched, last_watched)
    VALUES
        (?, ?, ?, ?, ?, ?, ?);`;

    db.all(query, [userID, mediaID, showID, currentTime, totalLength, watched, formattetDate], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (showID !== null) {
            let query = `INSERT OR REPLACE INTO media_watched(user_id, media_id, show_id, watched_seconds, total_length, watched, last_watched)
            VALUES
                (?, ?, ?, ?, ?, ?, ?);`;

            db.all(query, [userID, nextMediaID, showID, nextTime, nextTotalLength, nextWatched, formattetDate], (err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
            });
        }
        res.json(rows);
    });
}

const saveUserVolume = (req, res) => {
    const { userID, volume } = req.query;

    let query = `UPDATE users SET media_volume = ? WHERE id = ?`;

    db.all(query, [volume, userID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

function selectFromWatchList(userID, mediaID) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM watchlist WHERE user_id = ? AND media_id = ?`, [userID, mediaID], (err, rows) => {
            if (rows) {
                resolve(rows[0]);
            } else {
                reject(err);
            }
        });
    });
}

function addToWatchlist(userID, mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO watchlist(user_id, media_id) VALUES (?, ?)`, [userID, mediaID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(1);
            }
        });
    });
}

function removeFromWatchlist(userID, mediaID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM watchlist WHERE user_id = ? AND media_id = ?`, [userID, mediaID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(0);
            }
        });
    });
}

const getFromWatchlist = async(req, res) => {
    const { mediaID, userID } = req.query;

    try {
        const response = await selectFromWatchList(userID, mediaID);
        var status = null;

        if ( response !== undefined ) {
            status = 1;
        } else {
            status = 0;
        }
        res.json(status);
    } catch(err) {
        res.status(500).send('error_occured');
    }
}

const updateWatchlist = async(req, res) => {
    const { mediaID, userID } = req.query;

    try {
        const response = await selectFromWatchList(userID, mediaID);
        var status = null;

        if ( response !== undefined ) {
            status = await removeFromWatchlist(userID, mediaID);
        } else {
            status = await addToWatchlist(userID, mediaID);
        }

        res.json(status);
    } catch(err) {
        res.status(500).send('error_occured');
    }
}

module.exports = {
    getQuery,
    getSession,
    login,
    logout,

    // Settings
    getSettings,
    getApiKey,
    updateSettings,

    // Media
    addMovie,
    addShow,    
    getMedia,
    getMediaByInput,
    getMediaFiltered,
    addVideoPathToMedia,
    deleteShow,
    deleteSeason,
    saveNewPoster,
    saveNewBackdrop,

    // Episodes
    getSeasons,
    getEpisodes,
    getEpisode,

    // Genre
    saveGenre,
    getGenre,
    getGenreNameByID,
    genreSlider,
    genreMovies,

    // Highlights
    checkForHighlight,
    addHighlight,
    getAllHighlights,
    getHighlight,
    changeHighlightStatus,
    deleteHighlight,

    // Users
    getAllUsers,
    getUser,
    addUser,
    editUser,
    changeUserPassword,
    deleteUser,
    userIMGUpload,
    updateUserImg,
    getUploadedUserImages,
    deleteUploadedUserImage,
    saveUserVolume,

    getMediaWatched,
    safeWatchTime,

    getFromWatchlist,
    updateWatchlist
};
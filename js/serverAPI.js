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

//-- Login --
const login = (req, res) => {
    const { username, password } = req.body;
    // Finde den Benutzer in der Datenbank
    db.all("SELECT * FROM users WHERE username = ?", username, (err, user) => {
        if (user[0]) {
            // Vergleiche das eingegebene Passwort mit dem gehashten Passwort
            bcrypt.compare(password, user[0].password, (err, result) => {
                if (result) {
                    req.session.user = {
                        id: user[0].id,
                        name: user[0].username,
                        role: user[0].role,
                        isLoggedIn: true
                    }
                    req.session.save();
                    res.json({message: 'login successful'});
                } else {
                    // Falsches Passwort
                    res.status(401).json({ message: 'Invalid password' });
                }
            });
        } else {
            // Benutzer nicht gefunden
            res.status(404).json({ message: 'User not found' });
        }
    });
}

const logout = (req, res) => {
    const { username, role } = req.body;

    req.session.user = {
        name: username,
        role: role,
        isLoggedIn: false
    }
    req.session.save();
    res.json({message: 'logout successful'});
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
    const { orderBy, order } = req.query;

    let query = `SELECT * FROM media`;

    if (whereClause) {
        query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
    }

    if (order) {
        query += ` ${order}`;
    }

    db.all(query, [], (err, rows) => {
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

            for (const season of seasons) {
                sendSeason(season);
                console.log(`Data added successfully - Season`);
            }

            for (const episode of episodes) {
                sendEpisode(episode);
                console.log(`Data added successfully - Episode`);
            }

            res.json({ message: true });
        }
    });
};

const getMediaFiltered = (req, res) => {
    const { mediaType, orderBy, order, genreID } = req.query;
    let query = `SELECT m.* FROM media AS m
        JOIN media_genre AS mg ON m.tmdbID = mg.media_id
        WHERE mg.genre_id = "${genreID}" AND m.media_type = "${mediaType}" ORDER BY ${orderBy} ${order}`;

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

const getGenreNameByID = (req, res) => {
    const { id } = req.query;

    let query = `SELECT genre_name FROM genre WHERE genre_ID=${id}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

function sendSeason(season) {
    const columns = Object.keys(season).join(', ');
    const placeholders = Object.keys(season).map(() => '?').join(', ');
    const values = Object.values(season);

    db.run(`INSERT INTO seasons (${columns}) VALUES (${placeholders})`, values);
};

function sendEpisode(episode) {
    const columns = Object.keys(episode).join(', ');
    const placeholders = Object.keys(episode).map(() => '?').join(', ');
    const values = Object.values(episode);

    db.run(`INSERT INTO episodes (${columns}) VALUES (${placeholders})`, values);
};

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

    let query = `SELECT *
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
    const { username } = req.query;

    function createUserFolder(username) {
        const userFolder = path.join(__dirname, '../public/media/user_uploads');
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }
    
        const userUploadFolder = path.join(userFolder, username);
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
            const userUploadFolder = createUserFolder(username);
            cb(null, userUploadFolder);
        },
        filename: function (_, file, cb) {
            const userUploadFolder = createUserFolder(username);
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

    let query = `UPDATE users SET user_img = ? WHERE id = ?`;

    db.all(query, [img, userID], (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
}

const getUploadedUserImages = (req, res) => {
    const { username } = req.query;

    const userFolder = path.join(__dirname, '../public/media/user_uploads');
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
    }

    const imagesFolder = path.join(userFolder, username);
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
            res.json(imageList);
        });
    } catch (error) {
        console.error('Fehler beim Lesen des Bilderordners:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

const deleteUploadedUserImage = (req, res) => {
    const { img, username } = req.query; // Du könntest dies auch aus dem Anfragekörper (req.body) extrahieren

    const imagePath = path.join(__dirname, `../public/media/user_uploads/${username}/${img}`);

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

module.exports = {
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

    // Episodes
    getSeasons,
    getEpisodes,

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
    deleteUploadedUserImage
};
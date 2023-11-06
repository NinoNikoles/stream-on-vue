const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

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

// Genre
const saveGenre = (req, res) => {
    const { genres } = req.body;
    const placeholders = genres.map(genre => "(?, ?)").join(', ');
    const values = genres.flatMap(genre => [genre.id, genre.name]);
    
    db.run(`INSERT INTO genre (genre_id, genre_name) VALUES ${placeholders}`, values, (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to add data.' });
        } else {
            res.json({ message: 'Data added successfully!', title: values[1] });
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
    //const { id } = req.query;

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

module.exports = {
    getSettings,
    getApiKey,
    updateSettings,
    addMovie,
    addShow,
    getMedia,
    saveGenre,
    getGenre,
    getGenreNameByID,
    genreSlider,
    genreMovies,
};
const axios = require('axios');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

async function dbSetup() {
    // Datenbank
    const db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
            console.error('Fehler beim Öffnen der Datenbank:', err.message);
            return;
        } else {
            console.log('Verbindung zur SQLite-Datenbank hergestellt.');
            db.loadExtension('./sqlite/win/unicode.dll');
        }
    });

    async function createSettingsTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_name VARCHAR(255),
                setting_option VARCHAR(255)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    };

    async function createUsersTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username varchar(255) UNIQUE,
                firstname varchar(255),
                lastname varchar(255),
                password TEXT,
                img TEXT,
                uploads TEXT,
                role VARCHAR(10),
                media_volume FLOAT,
                created TIMESTAMP
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createGenreTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS genre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                genre_id INTEGER UNIQUE,
                genre_name VARCHAR(255),
                created TIMESTAMP
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createMediaTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tmdbID INTEGER UNIQUE,
                title TEXT,
                tagline TEXT,
                overview TEXT,
                poster TEXT,
                backdrop TEXT,
                rating INTEGER,
                release_date DATE,
                runtime INTEGER NULL,
                collection INTEGER NULL,
                file_path TEXT NULL,
                genres VARCHAR(255),
                trailer VARCHAR(255),
                show_season_count INTEGER,
                show_seasons TEXT,
                show_episodes_count INTEGER,
                media_type varchar(10),
                created TIMESTAMP
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createSeasonsTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS seasons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tmdbID INTEGER UNIQUE,
                title TEXT,
                overview TEXT,
                poster TEXT,
                season_number INTEGER,
                rating INTEGER,
                release_date DATE,
                episodes_count INTEGER,
                show_tmdbID INTEGER,
                created TIMESTAMP,
                FOREIGN KEY (show_tmdbID) REFERENCES media(tmdbID)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createEpisodesTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS episodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tmdbID INTEGER UNIQUE,
                episode_number INTEGER,
                title TEXT,
                overview TEXT,
                backdrop TEXT,
                file_path TEXT,
                runtime INTEGER,
                rating INTEGER,
                release_date DATE,
                show_id INTEGER,
                season_number INTEGER,
                created TIMESTAMP,
                FOREIGN KEY (show_id) REFERENCES media(tmdbID)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createMediaGenreTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS media_genre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                media_id INTEGER,
                genre_id INTEGER,
                UNIQUE (media_id, genre_id),
                FOREIGN KEY (media_id) REFERENCES media(tmdbID),
                FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createWatchlistTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                media_id INTEGER,
                UNIQUE (user_id, media_id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createHighlightsTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS highlights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                highlight_id INTEGER,
                highlight_status BOOLEAN,
                FOREIGN KEY (highlight_id) REFERENCES media(tmdbID)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function createMediaWatchedTable() {
        return new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS media_watched (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE,
                media_id INTEGER UNIQUE,
                show_id INTEGER NULL,
                watched_seconds DECIMAL(10,6),
                total_length DECIMAL(10,6),
                watched INTEGER(1),
                last_watched TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, async function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    async function initSettings() {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM settings WHERE setting_name = "one_time_setup"', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row || row.setting_option !== '1') {
                        const settingsData = [
                            ['one_time_setup', '0'],
                            ['api_key', null],
                            ['api_lang', 'en-US'],
                            ['site_title', 'Stream On'],
                            ['enable_edit_btn', 'false'],
                            ['design', 'false']
                        ];
            
                        const stmt = db.prepare('INSERT INTO settings (setting_name, setting_option) VALUES (?, ?)');
            
                        settingsData.forEach(data => {
                            stmt.run(data[0], data[1]);
                        });
            
                        stmt.finalize();
                        console.log(`${yellowColor}Einstellungen initialisiert.${resetColor}`);
                        resolve();
                    }
                }
            });
        });
    };

    async function createAdmin() {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE role="superadmin"', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        const username = 'admin';
                        const password = 'admin';
                        const role = 'superadmin';
                        const img = -1;
                        const hashed_password = bcrypt.hashSync(password, saltRounds);
                        const volume = 1;
                        const date = new Date().toLocaleDateString('en-GB');

                        db.run('INSERT INTO users (username, password, role, img, media_volume, created) VALUES (?, ?, ?, ?, ?, ?)', [username, hashed_password, role, img, volume, date], (err) => {
                            if (err) {
                                console.error('Fehler beim Erstellen des Admin-Benutzers:', err.message);
                                reject(err);
                            } else {
                                console.log(`${yellowColor}Admin-Benutzer erstellt.${resetColor}`);
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });
    };

    try {
        await createSettingsTable().then(() => { console.log(`Tabelle "Settings" ${greenColor}erstellt${resetColor}.`);});
        await initSettings();
        await createUsersTable().then(() => { console.log(`Tabelle "Users" ${greenColor}erstellt.${resetColor}`); });
        await createAdmin();
        await createGenreTable().then(() => { console.log(`Tabelle "Genre" ${greenColor}erstellt${resetColor}.`); });
        await createMediaTable().then(() => { console.log(`Tabelle "Media" ${greenColor}erstellt${resetColor}.`); });
        await createSeasonsTable().then(() => { console.log(`Tabelle "Seasons" ${greenColor}erstellt${resetColor}.`); });
        await createEpisodesTable().then(() => { console.log(`Tabelle "Episodes" ${greenColor}erstellt${resetColor}.`); });
        await createMediaGenreTable().then(() => { console.log(`Tabelle "Media-Genre" ${greenColor}erstellt${resetColor}.`); });
        await createWatchlistTable().then(() => { console.log(`Tabelle "Watchlist" ${greenColor}erstellt${resetColor}.`); });
        await createHighlightsTable().then(() => { console.log(`Tabelle "Highlights" ${greenColor}erstellt${resetColor}.`); });
        await createMediaWatchedTable().then(() => { 
            console.log(`Tabelle "Media watched" ${greenColor}erstellt${resetColor}.`);

            db.get('SELECT * FROM settings WHERE setting_name="one_time_setup"', (err, row) => {
                if (row) {
                    if ( row['setting_option'] === '0' ) {
                        db.run(`UPDATE settings SET setting_option="1" WHERE setting_name="one_time_setup"`, (err) => {
                            if (err) {
                                console.error('Setup fehlgeschlagen:', err.message);
                            } else {
                                console.log(`${yellowColor}Setup done.${resetColor}`);
                            }
                        });
                    }
                }
            });
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    dbSetup
};
const os = require('os');
const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Konsolenfarben
const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

// Bestimme das Betriebssystem
const platform = os.platform();
let extensionPath = '';

if (platform === 'win32') {
    extensionPath = './sqlite/win/';
} else if (platform === 'linux') {
    extensionPath = './sqlite/linux/';
} else if (platform === 'darwin') {
    extensionPath = './sqlite/mac/'; // Hier kommen die macOS `.dylib` Dateien hin
} else {
    console.error('Nicht unterstütztes Betriebssystem.');
}

// Tables
const Settings = require('./tables/Settings');
const Users = require('./tables/Users');
const Genre = require('./tables/Genre');
const Media = require('./tables/Media');
const Seasons = require('./tables/Seasons');
const Episodes = require('./tables/Episodes');
const MediaGenre = require('./tables/MediaGenre');
const Watchlist = require('./tables/Watchlist');
const Highlights = require('./tables/Highlights');
const MediaWatched = require('./tables/MediaWatched');

const tableDefinitions = {
    settings: Settings,
    users: Users, 
    genre: Genre,
    media: Media,
    seasons: Seasons,
    episodes: Episodes,
    media_genre: MediaGenre,
    watchlist: Watchlist,
    highlights: Highlights,
    media_watched: MediaWatched
};

async function connectToDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./database.db', (err) => {
            console.log(`----------------------------------------------------`);
            console.log(`Erkanntes OS: ${yellowColor}${platform}${resetColor}`);
            console.log(`----------------------------------------------------`);

            if (err) {
                reject(`Fehler beim Öffnen der Datenbank: ${err.message}`);
            } else {
                console.log(`${greenColor}Verbindung zur SQLite-Datenbank hergestellt.${resetColor}`);
                console.log(`----------------------------------------------------`);

                // Erweiterungen automatisch laden
                const extensions = [
                    // 'crypto',
                    // 'define',
                    // 'fileio',
                    // 'fuzzy',
                    // 'math',
                    // 'regexp',
                    // 'sqlean',
                    // 'stats',
                    // 'text',
                    'unicode',
                    // 'uuid',
                    // 'vsv'
                ];

                extensions.forEach(ext => {
                    const extPath = path.join(extensionPath, `${ext}${platform === 'win32' ? '.dll' : '.dylib'}`);
                    try {
                        db.loadExtension(extPath);
                        console.log('');
                        console.log(`Erweiterung geladen: ${yellowColor}${ext}${resetColor}`);
                        console.log('');
                    } catch (error) {
                        console.error(`Fehler beim Laden der Erweiterung ${ext}:`, error.message);
                    }
                });

                resolve(db);
            }
        });
    });
}

async function checkIfTableExists(db, tableName) {
    return new Promise((resolve, reject) => {
        db.get(`PRAGMA table_info(${tableName})`, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

async function createTable(db, tableName, tableDefinition) {
    const exists = await checkIfTableExists(db, tableName);
    return new Promise((resolve, reject) => {
        db.run(tableDefinition, (err) => {
            if (err) {
                reject(`${redColor}ERROR:${resetColor} Fehler beim Erstellen der Tabelle "${tableName}": ${err.message}`);
            } else {
                if (exists) {
                    console.log(`Tabelle "${greenColor}${tableName}${resetColor}" ${blueColor}geladen${resetColor}.`);
                } else {
                    console.log(`Tabelle "${yellowColor}${tableName}${resetColor}" ${greenColor}erstellt${resetColor}.`);
                }
                resolve();
            }
        });
    });
}

async function createAdmin(db) {
    const username = 'admin';
    const password = 'admin';
    const role = 'superadmin';
    const img = -1;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const volume = 1;
    const date = new Date().toLocaleDateString();

    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE role="superadmin"', (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (!row) {
                    db.run('INSERT INTO users (username, password, role, img, media_volume, created) VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPassword, role, img, volume, date], (err) => {
                        if (err) {
                            reject(`${redColor}ERROR:${resetColor} Fehler beim Erstellen des Admin-Benutzers: ${err.message}`);
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
}

async function initSettings(db) {
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
                        ['design', 'false'],
                        ['colors', null]
                    ];

                    const stmt = db.prepare('INSERT INTO settings (setting_name, setting_option) VALUES (?, ?)');

                    settingsData.forEach(data => {
                        stmt.run(data[0], data[1]);
                    });

                    stmt.finalize();
                    console.log(`${yellowColor}Einstellungen initialisiert.${resetColor}`);
                    resolve();
                } else {
                    resolve();
                }
            }
        });
    });
}

async function dbSetup() {
    try {
        const db = await connectToDatabase();

        for (const [tableName, tableDefinition] of Object.entries(tableDefinitions)) {
            await createTable(db, tableName, tableDefinition);
        }

        await initSettings(db);
        await createAdmin(db);

        // Abschließende Einstellung
        db.get('SELECT * FROM settings WHERE setting_name="one_time_setup"', (err, row) => {
            if (row && row.setting_option === '0') {
                db.run(`UPDATE settings SET setting_option="1" WHERE setting_name="one_time_setup"`, (err) => {
                    if (err) {
                        console.error(`${redColor}ERROR:${resetColor} Setup fehlgeschlagen:`, err.message);
                    } else {
                        console.log(`${yellowColor}Setup done.${resetColor}`);
                    }
                });
            }
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    dbSetup
};
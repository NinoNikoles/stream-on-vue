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

async function connectToDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./database.db', (err) => {
            if (err) {
                reject(`Fehler beim Öffnen der Datenbank: ${err.message}`);
            } else {
                console.log('Verbindung zur SQLite-Datenbank hergestellt.');

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
                        console.log(`Erweiterung geladen: ${extPath}`);
                    } catch (error) {
                        console.error(`Fehler beim Laden der Erweiterung ${ext}:`, error.message);
                    }
                });

                resolve(db);
            }
        });
    });
}

const tableDefinitions = {
    settings: `
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_name VARCHAR(255),
            setting_option VARCHAR(255)
        )
    `,
    users: `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(255) UNIQUE,
            firstname VARCHAR(255),
            lastname VARCHAR(255),
            password VARCHAR(255),
            img TEXT,
            uploads TEXT,
            role VARCHAR(10),
            media_volume FLOAT,
            created TIMESTAMP
        )
    `,
    genre: `
        CREATE TABLE IF NOT EXISTS genre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            genre_id INTEGER UNIQUE,
            genre_name VARCHAR(255),
            created TIMESTAMP
        )
    `,
    media: `
        CREATE TABLE IF NOT EXISTS media (
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
            media_type VARCHAR(10),
            created TIMESTAMP
        )
    `,
    seasons: `
        CREATE TABLE IF NOT EXISTS seasons (
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
        )
    `,
    episodes: `
        CREATE TABLE IF NOT EXISTS episodes (
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
        )
    `,
    media_genre: `
        CREATE TABLE IF NOT EXISTS media_genre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_id INTEGER,
            genre_id INTEGER,
            UNIQUE (media_id, genre_id),
            FOREIGN KEY (media_id) REFERENCES media(tmdbID),
            FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
        )
    `,
    watchlist: `
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            media_id INTEGER,
            UNIQUE (user_id, media_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `,
    highlights: `
        CREATE TABLE IF NOT EXISTS highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            highlight_id INTEGER,
            highlight_status BOOLEAN,
            FOREIGN KEY (highlight_id) REFERENCES media(tmdbID)
        )
    `,
    media_watched: `
        CREATE TABLE IF NOT EXISTS media_watched (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            media_id INTEGER,
            show_id INTEGER,
            watched_seconds DECIMAL(10, 6),
            total_length DECIMAL(10, 6),
            watched INTEGER,
            last_watched TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(user_id, media_id)
        )
    `
};

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
                    console.log(`Tabelle "${tableName}" ${blueColor}geladen${resetColor}.`);
                } else {
                    console.log(`Tabelle "${tableName}" ${greenColor}erstellt${resetColor}.`);
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
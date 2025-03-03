const Seasons = `
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
`;

module.exports = Seasons;
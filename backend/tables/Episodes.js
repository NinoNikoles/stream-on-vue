const Episodes = `
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
`;

module.exports = Episodes;
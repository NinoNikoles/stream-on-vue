const Media = `
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
`;

module.exports = Media;
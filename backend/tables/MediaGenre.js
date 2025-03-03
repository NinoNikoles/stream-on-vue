const MediaGenre = `
    CREATE TABLE IF NOT EXISTS media_genre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER,
        genre_id INTEGER,
        UNIQUE (media_id, genre_id),
        FOREIGN KEY (media_id) REFERENCES media(tmdbID),
        FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
    )
`;

module.exports = MediaGenre;
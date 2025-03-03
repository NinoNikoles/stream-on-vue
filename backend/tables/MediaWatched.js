const MediaWatched = `
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
`;

module.exports = MediaWatched;
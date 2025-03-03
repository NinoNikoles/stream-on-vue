const Watchlist = `
    CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        media_id INTEGER,
        UNIQUE (user_id, media_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;

module.exports = Watchlist;
const Highlights = `
    CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        highlight_id INTEGER,
        highlight_status BOOLEAN,
        FOREIGN KEY (highlight_id) REFERENCES media(tmdbID)
    )
`;

module.exports = Highlights;
const Genre = `
    CREATE TABLE IF NOT EXISTS genre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        genre_id INTEGER UNIQUE,
        genre_name VARCHAR(255),
        created TIMESTAMP
    )
`;

module.exports = Genre;
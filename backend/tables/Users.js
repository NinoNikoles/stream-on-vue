const Users = `
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
`;

module.exports = Users;
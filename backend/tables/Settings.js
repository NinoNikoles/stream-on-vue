const Settings = `
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_name VARCHAR(255),
        setting_option VARCHAR(255)
    )
`;

module.exports = Settings;
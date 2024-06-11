const session = require('express-session');
const { sessionSecret } = require('../config/config');

module.exports = session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 604800000 },
});
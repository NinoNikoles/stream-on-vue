const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // Setzt das Ziel auf Node.js
    externals: [nodeExternals()], // Verhindert das Bündeln von node_modules auf der Serverseite
    node: {
        __dirname: false, // Erlaubt die Verwendung von __dirname in den Modulen
    },
    // Andere Serverseitige Konfigurationen hier
};
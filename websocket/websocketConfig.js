const WebSocket = require('ws');
const { handleConnection, setupPingInterval } = require('./websocketHandlers');

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', handleConnection);
    setupPingInterval(wss);
    return wss;
}

module.exports = setupWebSocketServer;
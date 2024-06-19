const WebSocket = require('ws');
const { handleConnection, setupPingInterval } = require('./websocketHandlers');

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        console.log(`New connection from ${req.socket.remoteAddress}`);
        handleConnection(ws, req);
    });

    setupPingInterval(wss);
    return wss;
}

module.exports = setupWebSocketServer;
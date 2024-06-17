const WebSocket = require('ws'); // Ensure WebSocket is imported
const clients = {};

function handleConnection(ws, req) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const urlParams = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    const remotesessionID = urlParams.get('remotesessionID');

    if (!remotesessionID) {
        ws.close(1008, 'remotesessionID not provided');
        return;
    }

    if (!clients[remotesessionID]) {
        clients[remotesessionID] = [];
    }
    clients[remotesessionID].push(ws);

    console.log(`Client connected to session ${remotesessionID}`);
    ws.on('message', (message) => handleMessage(remotesessionID, ws, message));
    ws.on('close', () => handleClose(remotesessionID, ws));
    ws.on('error', (error) => handleError(error));
}

function handleMessage(remotesessionID, ws, message) {
    try {
        clients[remotesessionID].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
        console.log(`Message from session ${remotesessionID}: ${message}`);
    } catch (error) {
        console.error(`Error handling message: ${error}`);
    }
}

function handleClose(remotesessionID, ws) {
    const index = clients[remotesessionID].indexOf(ws);
    if (index !== -1) {
        clients[remotesessionID].splice(index, 1);
        console.log(`Client disconnected from session ${remotesessionID}`);
    }
}

function handleError(error) {
    console.error(`WebSocket error: ${error}`);
}

function heartbeat() {
    this.isAlive = true;
}

function setupPingInterval(wss) {
    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                console.log('Terminating dead connection');
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
}

module.exports = {
    handleConnection,
    setupPingInterval,
};

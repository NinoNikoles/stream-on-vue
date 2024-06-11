const clients = {};

function handleConnection(ws, req) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const urlParams = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    const remotesessionID = urlParams.get('remotesessionID');

    if (!clients[remotesessionID]) {
        clients[remotesessionID] = [];
    }
    clients[remotesessionID].push(ws);

    ws.on('message', (message) => handleMessage(remotesessionID, ws, message));
    ws.on('close', () => handleClose(remotesessionID, ws));
}

function handleMessage(remotesessionID, ws, message) {
    clients[remotesessionID].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
        }
    });
}

function handleClose(remotesessionID, ws) {
    const index = clients[remotesessionID].indexOf(ws);
    if (index !== -1) {
        clients[remotesessionID].splice(index, 1);
    }
}

function heartbeat() {
    this.isAlive = true;
}

function setupPingInterval(wss) {
    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
}

module.exports = {
    handleConnection,
    setupPingInterval,
};
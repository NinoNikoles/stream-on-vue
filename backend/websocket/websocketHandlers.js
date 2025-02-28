const WebSocket = require('ws');
const clients = {};
const sessionAdmins = {}; // Track session admins

function handleConnection(ws, req, wss) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const urlParams = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    const remotesessionID = urlParams.get('remotesessionID');
    const user = urlParams.get('user'); // Get the user from the URL parameters

    if (!remotesessionID || !user) {
        ws.close(1008, 'remotesessionID or user not provided');
        return;
    }

    if (!clients[remotesessionID]) {
        clients[remotesessionID] = [];
    }

    // Set the first user connecting as the admin for the session
    if (!sessionAdmins[remotesessionID]) {
        sessionAdmins[remotesessionID] = user;
        console.log(`Admin for session ${remotesessionID} is ${user}`);
    }

    // Attach admin property to the WebSocket instance
    ws.admin = sessionAdmins[remotesessionID];

    clients[remotesessionID].push(ws);

    ws.send(JSON.stringify({ type: 'admin', admin: sessionAdmins[remotesessionID] }));

    console.log(`Client ${user} connected to session ${remotesessionID}`);
    ws.on('message', (message) => handleMessage(remotesessionID, ws, message));
    ws.on('close', () => handleClose(remotesessionID, ws, wss, user));
    ws.on('error', (error) => handleError(error));
}

function handleMessage(remotesessionID, ws, message) {
    try {
        clients[remotesessionID].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                // client.send(JSON.stringify({
                //     type: 'message',
                //     message: message.toString(),
                //     admin: sessionAdmins[remotesessionID],
                // }));
                client.send(message.toString());
            }
        });
    } catch (error) {
        console.error(`Error handling message: ${error}`);
    }
}

function handleClose(remotesessionID, ws, wss, user) {
    var message = `dc:${user}`;
    handleMessage(remotesessionID, ws, message);
    
    const index = clients[remotesessionID].indexOf(ws);
    if (index !== -1) {
        clients[remotesessionID].splice(index, 1);
        console.log(`Client ${user} disconnected from session ${remotesessionID}`);
    }

    // Check if the admin disconnected and update if necessary
    if (clients[remotesessionID].length === 0) {
        delete clients[remotesessionID];
        delete sessionAdmins[remotesessionID];
    } else if (ws.user === sessionAdmins[remotesessionID]) {
        // If the admin disconnected, transfer admin to the next available client
        sessionAdmins[remotesessionID] = clients[remotesessionID][0].user;
        console.log(`New admin for session ${remotesessionID} is ${sessionAdmins[remotesessionID]}`);

        // Notify all clients about the new admin
        broadcastAdminInfo(remotesessionID, wss);
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

function broadcastAdminInfo(remotesessionID, wss) {
    const adminInfo = JSON.stringify({ type: 'admin', admin: sessionAdmins[remotesessionID] });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(adminInfo);
        }
    });
}

module.exports = {
    handleConnection,
    setupPingInterval,
};
// src/websocket/webSocketChecker.js
let socket = null;

export function getWebSocketInstance() {
  return socket;
}

export function createWebSocket(host, uuid, user) {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(`ws://${host}:3000/?remotesessionID=${uuid}&user=${user}`);

        socket.onclose = () => {
            console.log('WebSocket connection closed');
            socket = null; // Reset socket to null on close
        };
    } else {
        console.log('WebSocket connection already exists');
    }
    
    return socket;
}

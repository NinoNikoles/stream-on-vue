const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const { port } = require('./backend/config/config');
const errorHandler = require('./backend/middlewares/errorHandler');
const sessionConfig = require('./backend/middlewares/sessionConfig');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.static('public/build'));
app.use(express.json({ limit: '10000mb' }));
app.use(sessionConfig);
app.use(bodyParser.json());
app.use(helmet());

const { dbSetup } = require('./backend/db-setup');
dbSetup();

// Routes
const settingsRoutes = require('./backend/routes/settingsRoutes');
const sessionRoutes = require('./backend/routes/sessionRoutes');
const mediaRoutes = require('./backend/routes/mediaRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const fileRoutes = require('./backend/routes/fileRoutes');

app.use('/api/db', settingsRoutes);
app.use('/api/db', sessionRoutes);
app.use('/api/db', mediaRoutes);
app.use('/api/db', userRoutes);
app.use('', fileRoutes);

// WebSocket setup
const server = http.createServer(app);
const setupWebSocketServer = require('./backend/websocket/websocketConfig');
const wss = setupWebSocketServer(server);

app.use(errorHandler);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
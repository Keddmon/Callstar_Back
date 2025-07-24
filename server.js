/**
 * 2025-07-03
 * [HTTP + Socket 진입점]
 */
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupSerialPort } = require('./services/serialPort.service');
const handleSocket = require('./sockets/cidHandler.socket')

const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on('connection', handleSocket);
setupSerialPort(io);

server.listen(PORT, () => {
    console.log(`[server]Server running at http://localhost: ${PORT}`);
});
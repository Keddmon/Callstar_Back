const { setupSerialPort, closeSerialPort } = require('../services/serialPort.service');

module.exports = (socket) => {
    console.log(`[sockets][cid.socket] 소켓 핸들러 등록 완료 - ID: ${socket.id}`);

    socket.on('client-ready', () => {
        console.log('[SOCKET] Client is ready, sending device request');
    });

    socket.on('select-port', (port) => {
        console.log(`[SOCKET] Selected Port: ${port}`);
        closeSerialPort();
        setupSerialPort(socket.server, port);
    });

    socket.on('send-command', ({ channel = '1', opcode, payload = '' }) => {
        const { sendCommand } = require('../services/serialPort.service');
        console.log(`[SOCKET] sendCommand 요청 - 채널: ${channel}, OPCODE: ${opcode}, PAYLOAD: ${payload}`);
        sendCommand(channel, opcode, payload);
    });

    socket.on('simulate-opcode', ({ opcode, payload = '' }) => {
        const { handleOpcode } = require('../services/serialPort.service');
        console.log(`[SOCKET] simulate handleOpcode 요청 - OPCODE: ${opcode}, PAYLOAD: ${payload}`);
        handleOpcode(socket.server, opcode, payload);
    });
};
/**
 * [2025. 07. 07.(월)]
 * - CID 소켓 핸들러 등록
 */
const { setupSerialPort, closeSerialPort } = require('../services/serialPort.service');

module.exports = (socket) => {
    console.log(`[sockets][cid.socket] 소켓 핸들러 등록 완료 - ID: ${socket.id}`);

    socket.on('client-ready', () => {
        console.log('[SOCKET] Client is ready, sending device request');



        // 테스트용 (강제 Trigger - 테스트 후 삭제 필요
        const { sendCommand, handleOpcode } = require('../services/serialPort.service');
        const { OPCODES } = require('../utils/protocol.constants');



        // 장비 ID 확인
        // sendCommand('1', OPCODES.DEVICE_INFO);



        // 수신호 처리 프로토콜
        // setTimeout(() => {
        //     handleOpcode(socket.server, 'I', '01011111111');
        // }, 500);



        // 발신 강제종료
        // setTimeout(() => {
        //     handleOpcode(socket.server, 'F');
        // }, 500);



        // 수화기 들었을 경우
        // setTimeout(() => {
        //     handleOpcode(socket.server, 'S');
        // }, 500);



        // 수화기 내렸을 경우
        // setTimeout(() => {
        //     handleOpcode(socket.server, 'E');
        // }, 500);
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
/**
 * [시리얼 포트 연결/수신]
 */
const { SerialPort } = require(`serialport`);
const { serialConfig } = require('../config/serial.config');
const { setConnectionStatus } = require('../controllers/status.controller');
const { decodeCIDPacket, encodeCIDPacket } = require('../utils/packetParser');
const { saveCallLog } = require('../services/callLog.service');
const { STX, ETX, OPCODES } = require('../utils/protocol.constants');



let buffer = '';
let serialPort;



/**
 * [socket 통신 함수]
 */
const emitCIDEvent = (io, type, payload = {}) => {
    io.emit('cid-data', { type, ...payload });
};



/**
 * [opcode 처리 분기]
 */
const handleOpcode = (io, opcode, payload) => {
    console.log(`[service][serialPort.service] OPCODE: ${opcode}, PAYLOAD: ${payload}`);

    switch (opcode) {
        case OPCODES.INCOMING:
            if (['P', 'C', 'O'].includes(payload)) {
                emitCIDEvent(io, 'masked', { reason: payload }); // P: Private, C: Public, O: Unavailable
            } else {
                emitCIDEvent(io, 'incoming', { phoneNumber: payload });
                saveCallLog(payload);
            }
            break;

        case OPCODES.FORCED_END:
            emitCIDEvent(io, 'forced-end');
            break;

        case OPCODES.OFF_HOOK:
            emitCIDEvent(io, 'off-hook');
            break;

        case OPCODES.ON_HOOK:
            emitCIDEvent(io, 'on-hook');
            break;

        case OPCODES.DIAL_COMPLETE:
            emitCIDEvent(io, 'dial-complete');
            break;

        case OPCODES.DEVICE_INFO_RES:
            emitCIDEvent(io, 'device-info', { payload });
            break;

        default:
            console.warn('[services][serialPort.service] Unknown opcode: ', opcode);
    }
}



/**
 * [시리얼 포트 설정]
 */
const setupSerialPort = (io) => {
    try {
        serialPort = new SerialPort(serialConfig);

        // 시리얼 포트 Open 시
        serialPort.on('open', () => {
            console.log('[services][serial.service]Serial port opened');
            setConnectionStatus(true);
        });

        // 시리얼 포트 Open 시 에러가 발생했을 때
        serialPort.on('error', (err) => {
            console.error('[services][serial.service] Serial port error: ', err.message);
        });

        // 시리얼 포트에 data가 넘어올 시
        serialPort.on('data', (data) => {
            buffer += data.toString();

            // 패킷 끝까지 도달하지 않은 경우 return
            if (!buffer.includes(ETX)) return;

            const start = buffer.indexOf(STX);
            const end = buffer.indexOf(ETX, start);

            if (start === -1 || end === -1 || end <= start) return;

            const packet = buffer.slice(start, end + 1);
            buffer = buffer.slice(end + 1); // 다음 버퍼로 넘어감

            const parsed = decodeCIDPacket(packet);
            if (!parsed || !parsed.opcode) {
                console.warn('[services][serialPort.service] Invalid packet: ', packet);
                return;
            }

            const { opcode, payload } = parsed;
            handleOpcode(io, opcode, payload);
        });

    } catch (err) {
        console.error('[services][serial.service] Serial port setup error: ', err);
    }
};



/**
 * [CID 기기로 패킷 전송]
 */
const sendCommand = (channel = '1', opcode = 'O', payload = '') => {
    const command = encodeCIDPacket(channel, opcode, payload);
    if (serialPort && serialPort.isOpen) {
        serialPort.write(command, err => {
            if (err) console.error('[serialPort.service] Send fail:', err);
            else console.log('[serialPort.service] Sent:', command);
        });
    } else {
        console.warn('[serialPort.service] Serial port is not open');
    }
};

module.exports = {
    setupSerialPort,
    sendCommand,
};
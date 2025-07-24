const { SerialPort } = require(`serialport`);
const { setConnectionStatus } = require('../controllers/status.controller');
const { decodeCIDPacket, encodeCIDPacket } = require('../utils/packetParser');
const { saveCallLog } = require('../services/callLog.service');
const { STX, ETX, OPCODES } = require('../utils/protocol.constants');



let buffer = '';
let serialPort = null;



/**
 * [시리얼 포트 설정]
 */
const setupSerialPort = (io, portPath = 'COM3') => {
    try {
        serialPort = new SerialPort({
            path: portPath,
            baudRate: 19200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        });

        // 시리얼 포트 Open 시
        serialPort.on('open', () => {
            console.log('[services][serial.service] Serial port opened');
            setConnectionStatus(true);
        });

        // 시리얼 포트 Open 시 에러가 발생했을 때
        serialPort.on('error', (err) => {
            console.error('[services][serialPort.service] Serial port error: ', err.message);
        });

        // 시리얼 포트에 data가 넘어올 시
        serialPort.on('data', (data) => {
            buffer += data.toString();
            console.log('[services][serialPort.service] buffer: ', buffer);

            // 패킷 끝까지 도달하지 않은 경우 return
            if (!buffer.includes(ETX)) return;

            const start = buffer.indexOf(STX);
            const end = buffer.indexOf(ETX, start);

            if (start === -1 || end === -1 || end <= start) return;

            const packet = buffer.slice(start, end + 1);
            buffer = buffer.slice(end + 1); // 다음 버퍼로 넘어감

            const parsed = decodeCIDPacket(packet);
            if (!parsed || !parsed.opcode) {
                console.warn('[services][serialPort.service] 존재하지 않는 패킷: ', packet);
                return;
            }

            const { opcode, payload } = parsed;
            handleOpcode(io, opcode, payload);
        });

    } catch (err) {
        console.error('[services][serialPort.service] 시리얼 포트 설정 에러: ', err);
    }
};



/**
 * [시리얼 포트 닫기]
 */
const closeSerialPort = () => {
    if (serialPort && serialPort.isOpen) {
        serialPort.close(err => {
            if (err) console.error('[services][serialPort.service] 시리얼 포트를 닫는 중 에러 발생: ', err);
            else console.log('[services][serialPort.service] 시리얼 포트 닫힘.');
        });
    }
};



/**
 * [socket 통신 함수]
 */
const emitCIDEvent = (io, type, payload = {}) => {
    io.emit('cid-data', { type, ...payload });
};



/**
 * [OPCODE 처리 분기]
 */
const handleOpcode = (io, opcode, payload) => {

    console.log('#############################################################');
    console.log(`# [services][serialPort.service] OPCODE: ${opcode}`);
    console.log(`# [services][serialPort.service] PAYLOAD: ${payload}`);
    console.log('#############################################################');

    switch (opcode) {

        /* ===== 장비 ID 확인 ===== */
        // 이 Protocol을 이용하여 '통신 포트 자동설정기능' 및 '현재 사용 중인 장비의 회선수'를 알 수 있음
        case 'P':
            if (!payload || payload.trim() === '') {
                emitCIDEvent(io, 'device-info-req', { info: payload });
            } else {
                emitCIDEvent(io, 'device-info-res', { info: payload });
            }
            break;



        /* ===== 수신호 처리 Protocol ===== */
        case OPCODES.INCOMING:
            if (['P', 'C', 'O'].includes(payload)) {
                emitCIDEvent(io, 'masked', { reason: payload }); // P: Private, C: Public, O: Unavailable
                console.log(`[services][serialPort.service] Masked: ${payload}`);
            } else {
                emitCIDEvent(io, 'incoming', { phoneNumber: payload });
                saveCallLog(payload);
            }
            break;



        /* ===== 발신호 처리 Protocol ===== */
        case OPCODES.DIAL_OUT:
            emitCIDEvent(io, 'dial-out', { phoneNumber: payload });
            break;

        case OPCODES.DIAL_COMPLETE:
            emitCIDEvent(io, 'dial-complete', { phoneNumber: payload });
            break;

        case OPCODES.FORCED_END:
            emitCIDEvent(io, 'forced-end');
            break;



        /* ===== 수화기 처리 Protocol ===== */
        case OPCODES.OFF_HOOK:
            emitCIDEvent(io, 'off-hook');
            break;

        case OPCODES.ON_HOOK:
            emitCIDEvent(io, 'on-hook');
            break;

        default:
            console.warn('[services][serialPort.service] 알 수 없는 명렁어(opcode): ', opcode);
    }
}



/**
 * [CID 기기로 패킷 전송]
 */
const sendCommand = (channel = '1', opcode = 'O', payload = '') => {
    const command = encodeCIDPacket(channel, opcode, payload);
    if (serialPort && serialPort.isOpen) {
        serialPort.write(command, err => {
            if (err) console.error('[services][serialPort.service] 전송 실패:', err);
            else console.log('[services][serialPort.service] 전송:', command);
        });
    } else {
        console.warn('[services][serialPort.service] Serial port is not open');
    }
};



module.exports = {
    setupSerialPort,
    closeSerialPort,
    sendCommand,
    handleOpcode,
};
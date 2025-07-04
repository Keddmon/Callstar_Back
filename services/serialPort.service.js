/**
 * 2025-07-03
 * [시리얼 포트 연결/수신]
 */
const { SerialPort } = require(`serialport`);

const fs = require('fs');
const { portName, baudRate } = require('../config/serial.config');
const { setConnectionStatus } = require('../controllers/status.controller');
const { parsePacket, makePacket } = require('../utils/packetParser');
const { OPCODES } = require('../utils/protocol.constants');
const { saveCallLog } = require('../services/callLog.service');

let receivedData = '';
let serialPort;

const setupSerialPort = (io) => {
    try {
        serialPort = new SerialPort({ path: portName, baudRate, dataBits: 8, stopBits: 1, parity: 'none' });

        serialPort.on('open', () => {
            console.log('[services][serial.service]Serial port opened');
            setConnectionStatus(true);
        });

        serialPort.on('error', (err) => {
            console.error('[services][serial.service] Serial port error: ', err.message);
        });
        
        serialPort.on('data', (data) => {
            receivedData += data.toString();
            if (!receivedData.includes('\x03')) return;

            const parsed = parsePacket(receivedData);
            receivedData = '';
            if (!parsed) return;

            const { opcode, payload } = parsed;
            handleOpcode(opcode, payload, io);
        });

    } catch (err) {
        console.error('[services][serial.service] Serial port setup error: ', err);
    }
};

const handleOpcode = (opcode, payload, io) => {
    console.log(`opcode: ${opcode}, payload: ${payload}, io: ${io}`);
    switch (opcode) {
        case OPCODES.INCOMING:
            io.emit('cid-data', { type: 'incoming', phoneNumber: payload });
            saveCallLog(payload);
            break;
        case OPCODES.FORCED_END:
            io.emit('cid-data', { type: 'forced-end' });
            break;
        case OPCODES.OFF_HOOK:
            io.emit('cid-data',  { type: 'off-hook' });
            break;
        case OPCODES.ON_HOOK:
            io.emit('cid-data', { type: 'on-hook' });
            break;
        case OPCODES.DEVICE_INFO_RES:
            io.emit('cid-data', { type: 'device-info', payload });
            break;
        case OPCODES.PUBLIC_PHONE:
        case OPCODES.PRIVATE_PHONE:
        case OPCODES.UNAVAILABLE:
            io.emit('cid-data', { type: 'masked', reason: opcode });
            break;
        default:
            console.log('[service][serialPort.service] Unknown opcode: ', opcode);
    }
}



const sendCommand = (channel = '1', opcode = 'O', payload = '') => {
    const command = makePacket(channel, opcode, payload);
    serialPort.write(command, err => {
        if (err) console.error('Send Fail: ', err);
        else console.log('[service][serialPort.service] Sent: ', command);
    });
}

module.exports = { setupSerialPort };
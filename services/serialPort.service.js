/**
 * 2025-07-03
 * [시리얼 포트 연결/수신]
 */
const { SerialPort } = require(`serialport`);

const fs = require('fs');
const { portName, baudRate } = require('../config/serial.config');
const { setConnectionStatus } = require('../controllers/status.controller');
const { parsePacket } = require('../utils/packetParser');
const { saveCallLog } = require('../services/callLog.service');

let receivedData = '';
let serialPort;

const setupSerialPort = (io) => {
    try {
        serialPort = new SerialPort({ path: portName, baudRate, dataBits: 8, stopBits: 1, parity: 'none' });

        serialPort.on('open', () => {
            console.log('[services][serial.service]Serial port opened');
            setConnectionStatus(true);
            sendDataToCID('테스트 송신 데이터');
        });

        serialPort.on('error', (err) => {
            console.error('[services][serial.service] Serial port error: ', err.message);
        });
        
        serialPort.on('data', (data) => {
            receivedData += data.toString();
            if (!receivedData.includes('\x03')) return;

            const packet = parsePacket(receivedData);
            receivedData = '';

            if (!packet) return;

            const { channel, opcode, payload } = packet;

            console.log(`[services][serial.service] 채널: ${channel}, 명령: ${opcode}, 데이터: ${payload}`);

            if (opcode === 'O') {
                io.emit('cid-data', { type: 'incoming', phoneNumber: payload });
                saveCallLog(payload);
            } else if (opcode === 'F') {
                io.emit('cid-data', { type: 'forced-end' });
            } else if (opcode === 'S') {
                io.emit('cid-data', { type: 'off-hook' });
            } else if (opcode === 'E') {
                io.emit('cid-data', { type: 'on-hook' });
            } else if (opcode === 'P') {
                io.emit('cid-data', { type: 'device-check' });
            }
        });

    } catch (err) {
        console.error('[services][serial.service] Serial port setup error: ', err);
    }
};

const sendDataToCID = (message) => {
    if (serialPort && serialPort.isOpen) {
        serialPort.write(message + '\r\n', (err) => {
            if (err) console.error('[services][serial.service] 송신 실패: ', err.message);
            else console.log('[services][serial.service] 송신 선공: ', message);
        });
    } else {
        console.log('[services][serial.service] Serial 포트가 열려있지 않음');
    }
};

module.exports = { setupSerialPort, sendDataToCID };
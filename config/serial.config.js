/**
 * [2025. 07. 03.(목)]
 * - 시리얼 설정
 */
const serialConfig = {
    path: 'COM3',
    baudRate: 19200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
};

module.exports = { serialConfig };
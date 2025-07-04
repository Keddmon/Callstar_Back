/**
 * 2025-07-03
 * [패킷 파싱 유틸]
 */
const { STX, ETX } = require('./protocol.constants');

/**
 * 
 * @param {Buffer | string} data 
 * @returns {{channel: string, opcode: string, payload: string} | null}
 */
const decodeCIDPacket = (data) => {
    const raw = data.toString();

    if (!raw.startsWith(STX) || !raw.endsWith(ETX)) return null;
    if (raw.length < 5) return null;

    const channel = raw[1];
    const opcode = raw[2];
    const payload = raw.slice(3, -1).trim(); // STX~ETX 사이, right padding 제거

    return { channel, opcode, payload };
}

/**
 * 
 * @param {string} channel 
 * @param {string} opcode 
 * @param {string} payload 
 * @returns {string} CID 형식 문자열
 */
const encodeCIDPacket = (channel = '1', opcode, payload = '') => {
    let content = `${channel}${opcode}${payload}`.padEnd(21, ' ');
    return `${STX}${content}${ETX}`;
}

module.exports = { decodeCIDPacket, encodeCIDPacket };
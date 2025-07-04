/**
 * 2025-07-03
 * [패킷 파싱 유틸]
 */
const { STX, ETX, OPCODES } = require('./protocol.constants');

const parsePacket = (data) => {
    const str = data.toString();
    if(!str.startsWith(STX) || !str.endsWith(ETX)) return null;

    const channel = str[1];
    const opcode = str[2];
    const payload = str.slice(3, -1).trim();

    return { channel, opcode, payload };
}

const makePacket = (channel = '1', opcode = 'O', payload = '') => {
    let content = `${channel}${opcode}${payload}`.padEnd(21, ' ');
    return `\x02${content}\x03`;
}

module.exports = { parsePacket, makePacket };
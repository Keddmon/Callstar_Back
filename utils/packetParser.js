const { STX, ETX } = require('./protocol.constants');



const decodeCIDPacket = (data) => {
    const raw = data.toString();

    if (!raw.startsWith(STX) || !raw.endsWith(ETX)) return null;
    if (raw.length < 5) return null;

    const channel = raw[1];
    const opcode = raw[2];
    const payload = raw.slice(3, -1).trim(); // STX~ETX 사이, right padding 제거

    return { channel, opcode, payload };
}



const encodeCIDPacket = (channel = '1', opcode, payload = '') => {
    let content = `${channel}${opcode}${payload}`.padEnd(21, ' ');
    return `${STX}${content}${ETX}`;
}

module.exports = { decodeCIDPacket, encodeCIDPacket };
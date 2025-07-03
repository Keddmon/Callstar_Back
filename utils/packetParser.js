/**
 * 2025-07-03
 * [패킷 파싱 유틸]
 */
function parsePacket(buffer) {
    const packet = buffer.toString();
    if(!packet.startsWith('\x02') || !packet.endsWith('\x03')) return null;

    const channel = packet[1];
    const opcode = packet[2];
    const payload = packet.slice(3, -1).trim();

    return { channel, opcode, payload };
}

module.exports = { parsePacket };
/**
 * 2025-07-03
 * [연결 상태 등 HTTP 응답 처리]
 */
let isConnected = false;

const getConnectionStatus = (req, res) => {
    res.json({
        status: isConnected ? 'connected' : 'disconnected',
        message: isConnected ? '[controller][cid.controller]Serial Port: 연결 성공' : '[controller][cid.controller]Serial Port: 연결 실패',
    });
};

const setConnectionStatus = (status) => {
    isConnected = status;
};

module.exports = { getConnectionStatus, setConnectionStatus };
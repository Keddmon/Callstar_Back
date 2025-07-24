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
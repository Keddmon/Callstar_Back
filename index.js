const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { SerialPort } = require('serialport');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware 설정
app.use(cors());
app.use(bodyParser.json());

// 시리얼 포트 설정
const portName = 'COM3'; // 실제 CID 기기와 연결된 포트
const baudRate = 19200;
let isConnected = false;
let serialPort;

// 수신된 데이터 
let receivedData = '';

// HTTP 및 WebSocket 서버 설정
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// socket.io 연결 확인
io.on("connection", (socket) => {
    console.log(`WebSocket 접속: ${socket.id}`);
});

// 시리얼 포트 연결 확인
try {
    serialPort = new SerialPort({ path: portName, baudRate: baudRate, parity: 'none', dataBits: 8, stopBits: 1 }, (err) => {
        if (err) {
            console.error('시리얼 포트 연결 에러: ', err.message);
        }
    });
} catch (err) {
    console.error('시리얼 포트 초기화 에러: ', err);
}

// CID 기기 연결 확인
if (serialPort) {

    // 시리얼 포트가 열렸을 때
    serialPort.on('open', () => {
        console.log('serial port opened');
        isConnected = true;

        sendDataToCID('테스트 송신 데이터');
    });

    // 시리얼 포트 에러 발생 시
    serialPort.on('error', (err) => {
        console.error('Serial port error:', err.message);
    });

    // 데이터 처리 부분
    serialPort.on('data', (data) => {
        receivedData += data.toString();

        console.log('원시 데이터: ', data);
        // console.log('문자열 변환 데이터:', data.toString());
        console.log('==========================================')

        if (receivedData.includes('\x03')) {
            console.log('받은 데이터:', receivedData)

            if (receivedData.includes('P')) {
                console.log('기기 확인: ', data)
                io.emit('cid-data', { type: 'device-check'});
            }

            // 수신호가 발생한 경우
            if (receivedData.includes('02 1 I')) {
                const phoneNumber = receivedData.slice(3, );
                console.log(phoneNumber);

                fs.appendFile('call_log.txt', `${new Date().toISOString()} - ${phoneNumber}\n`, (err) => {
                    if (err) {
                        console.error('전화번호 저장 실패: ', err);
                    } else {
                        console.log('전화번호 저장 성공');
                    }
                });
                io.emit('cid-data', { type: 'incoming', phoneNumber: phoneNumber });
            }
            if (receivedData.includes('1I')) {

                // '02 1 I'로 시작하는 데이터는 수신호를 의미하며, 뒤따르는 부분은 전화번호
                const phoneNumber = receivedData.slice(3, ); // '02 1 I' 이후의 전화번호 부분 추출

                if (phoneNumber == 'P') {
                    io.emit('cid-data', { type: 'P' });
                    console.log('발신정보표시 금지된 전화에서 전화가 올 경우: P = ', phoneNumber);
                } else if (phoneNumber == 'C') {
                    io.emit('cid-data', { type: 'C' });
                    console.log('공중전화에서 전화가 올 경우: C = ', phoneNumber);
                } else if (phoneNumber == 'O') {
                    io.emit('cid-data', { type: 'O' });
                    console.log('발신번호 수집불가 상태에서 전화가 올 경우: O = ', phoneNumber);
                }
                console.log('수신된 전화번호: ', phoneNumber);

                // 전화번호 저장
                fs.appendFile('call_log.txt', `${new Date().toISOString()} - ${phoneNumber}\n`, (err) => {
                    if (err) {
                        console.error('전화번호 저장 실패: ', err);
                    } else {
                        console.log('전화번호 저장 성공');
                    }
                });
                io.emit('cid-data', { type: 'incoming', phoneNumber: phoneNumber });



            } else if (receivedData.startsWith('02 1 F')) {
                // '02 1 F'로 시작하는 데이터는 발신 강제 종료를 의미
                console.log('사용자가 발신을 강제종료 시킬 경우: 1F = ', receivedData);
                io.emit('cid-data', { type: 'forced-end' });
            } else if (receivedData.includes('1F')) {
                console.log('사용자가 발신을 강제종료 시킬 경우: 1F = ', receivedData);
                io.emit('cid-data', { type: 'forced-end' });


            } else if (receivedData.startsWith('02 1 S')) {
                // '02 1 S'로 시작하는 데이터는 사용자가 수화기를 들었음을 의미
                console.log('수화기 들기:', receivedData);
                io.emit('cid-data', { type: 'off-hook' });
            } else if (receivedData.includes('1S')) {
                console.log('사용가 수화기를 들었을 경우: 02H 1 S All space')
                io.emit('cid-data', { type: 'off-hook' });


            } else if (receivedData.startsWith('02 1 E')) {
                // '02 1 E'로 시작하는 데이터는 사용자가 수화기를 내려놓았음을 의미
                console.log('수화기 내려놓기:', receivedData);
                io.emit('cid-data', { type: 'on-hook' });
            } else if (receivedData.includes('1E')) {
                console.log('사용자가 수화기를 내려 놓았을 경우: 02H 1 E All space')
            } // 포트 미러링 / 펌웨어



            receivedData = '';
        }
    });
}

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Callstar Test by JS');
});

// 연결 상태 확인 API
app.get('/api/connection-status', (req, res) => {
    if (isConnected) {
        res.json({ status: 'connected', message: 'Serial Port: 연결 성공' });
    } else {
        res.json({ status: 'disconnected', message: 'Serial Port: 연결 실패' });
    }
});

// 서버 시작
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

/* ===== Test Function ===== */
/**
 * CID 기기로 데이터 송신
 * --
 */
function sendDataToCID(message) {
    if (serialPort && serialPort.isOpen) {
        console.log('CID에 송신한 데이터: ', message);
        serialPort.write(message + '\r\n', (err) => {
            if (err) {
                console.log('시리얼 포트에 데이터 작성 실패: ', err.message);
            } else {
                console.log('작성 성공');
            }
        });
    } else {
        console.log('시리얼 포트 안열림');
    }
}

const { SerialPort } = require('serialport');

const port = new SerialPort({
    path: 'COM6',
    baudRate: 19200,
    autoOpen: true,
});

const FAKE_DATA = '\x021I0312417755\x03'

port.on('open', () => {
    console.log('COM6 포트 열림, 데이터 전송 시도');
    port.write(FAKE_DATA, err => {
        if (err) return console.error('전송 실패: ', err);
        console.log('가짜 CID 수신 데이터 전송 완료');
    })
})
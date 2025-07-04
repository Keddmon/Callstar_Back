// terminal: node test_sender

const { SerialPort } = require('serialport');

const port = new SerialPort({
    path: 'COM3',
    baudRate: 19200,
    autoOpen: true,
});

const FAKE_DATA = '02H1I031241775503H'

port.on('open', () => {
    console.log('COM6 포트 열림, 데이터 전송 시도');
    port.write(FAKE_DATA, err => {
        if (err) return console.error('전송 실패: ', err);
        console.log('가짜 CID 수신 데이터 전송 완료');
    })
})
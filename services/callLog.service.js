/**
 * 2025-07-03
 * [전화번호 로그 저장 처리]
 */
const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, '../logs/call_log.txt');

function saveCallLog(phoneNumber) {
    const logLine = `${new Date().toISOString()} - ${phoneNumber}\n`;
    fs.appendFile(logPath, logLine, (err) => {
        if (err) console.error('[services][callLog.service] 로그 저장 실패: ', err);
    });
}

module.exports = { saveCallLog };
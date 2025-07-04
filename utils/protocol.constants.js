module.exports = {
    STX: '\x02',
    ETX: '\x03',
    OPCODES: {
        INCOMING: 'I',            // 수신 전화
        DIAL_OUT: 'O',            // 발신 요청
        DIAL_COMPLETE: 'K',       // 다이얼 완료
        FORCED_END: 'F',          // 강제 종료
        OFF_HOOK: 'S',            // 수화기 들음
        ON_HOOK: 'E',             // 수화기 내려놓음
        DEVICE_INFO_REQ: 'P',     // 장치 정보 요청 (PC → 장치)
        DEVICE_INFO_RES: 'P',     // 장치 정보 응답 (장치 → PC)

        MASKED_PRIVATE: 'P',      // 발신번호표시 금지 (payload='P')
        MASKED_PUBLIC: 'C',       // 공중전화 (payload='C')
        MASKED_UNAVAILABLE: 'O',  // 수집불가 (payload='O')
    }
};
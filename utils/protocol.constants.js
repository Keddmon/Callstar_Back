/**
 * [2025. 07. 07.(월)]
 * - CIT-130(1회선) 장치와 PC 간의 Protocol 정의
 */

module.exports = {
    STX: '\x02',                  // 02H: 시작
    ETX: '\x03',                  // 03H: 끝

    OPCODES: {                    // 명령어

        /* ===== 장비 ID 확인 ===== */
        DEVICE_INFO_REQ: 'P',     // 장치 정보 요청   (PC → 장치)
        DEVICE_INFO_RES: 'P',     // 장치 정보 응답   (장치 → PC)



        /* ===== 수신호 처리 Protocol: (장치 → PC) ===== */
        INCOMING: 'I',            // 수신 전화
        
        MASKED_PRIVATE: 'P',      // 발신번호표시 금지  (payload='P')
        MASKED_PUBLIC: 'C',       // 공중전화           (payload='C')
        MASKED_UNAVAILABLE: 'O',  // 수집불가           (payload='O')



        /* ===== 발신호 처리 Protocol ===== */
        DIAL_OUT: 'O',            // 발신 요청     (PC → 장치)
        DIAL_COMPLETE: 'K',       // 다이얼 완료   (장치 → PC)
        FORCED_END: 'F',          // 강제 종료     (PC → 장치)



        /* ===== 수화기 처리 Protocol ===== */
        OFF_HOOK: 'S',            // 수화기 들음
        ON_HOOK: 'E',             // 수화기 내려놓음
    }
};
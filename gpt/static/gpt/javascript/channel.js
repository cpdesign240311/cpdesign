//window 통신 관련

// 이미 요청 중인지 여부를 확인하기 위한 플래그
let isRequesting = false; 

//iframe으로부터 문서 내용 요청 및 반환
function getDocumentData(){
    return new Promise(function(resolve, reject){
        //요청 중인 경우 reject
        if (isRequesting) {
            reject("이미 요청 중입니다.");
            return;
        }
        
        isRequesting = true;
        
        //iframe으로부터 응답받은 메시지를 처리하기 위한 함수
        function handleMessage(e) {
            let type = e.data.type;
            if (type == "data") {
                let data = e.data.data; //문서 내용
                window.removeEventListener("message", handleMessage);
                isRequesting = false;
                resolve(data);
            }
        }
        
        //윈도우에 메시지 핸들러 추가
        window.addEventListener("message", handleMessage);

        // iframe 문서 내용 요청
        let iframe = window.opener.document.getElementById("mainFrame").contentWindow;
        iframe.postMessage("get-content", "*");

        // 타임아웃 설정
        setTimeout(function() {
            if (isRequesting) {
                window.removeEventListener("message", handleMessage);
                isRequesting = false;
                reject("요청 시간이 초과되었습니다.");
            }
        }, 5000); // 5초 후에 타임아웃
    });
}

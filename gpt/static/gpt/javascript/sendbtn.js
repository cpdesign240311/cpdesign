//send_btn 캡슐화

var send_button = document.getElementById('send_button');
var send_btn_activated = false;

//전송 버튼 상태(활성화/비활성화) 결정해서 반영
function setSendBtnStatus(){
    if(getUserInputValue().replace(/\n/g, '') !== '' && !getResponseWait()){
        //전송 버튼 활성화
        sendBtnActivate(); 
    }
    else{
        //전송 버튼 비활성화
        sendBtnDisable();
    }
}

//전송 버튼 활성화
function sendBtnActivate(){
    send_button.style.cursor = 'pointer';
    send_button.style.pointerEvents = 'auto';
    send_button.style.color = 'black';
    send_btn_activated = true;
}
//전송 버튼 비활성화
function sendBtnDisable(){
    send_button.style.cursor = 'default';
    send_button.style.pointerEvents = 'none';
    send_button.style.color = 'gray';
    send_btn_activated = false;
}
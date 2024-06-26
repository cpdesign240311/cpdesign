//input_box, user_input 캡슐화

var input_box = document.getElementById('input_box');
var user_input = document.getElementById('user_input');

const default_input_box_height = 33;

//user_input의 value를 반환
function getUserInputValue(){
    return user_input.value;
}

//user_input의 value를 변경
function setUserInputValue(value){
    user_input.value = value;
}

//input_box의 height를 value(px)로 변경
function setInputBoxHeight(value){
    input_box.style.height = value + 'px';
}

//user_input 비우기
function emptyUserInput(){
    setUserInputValue('');
    setInputBoxHeight(default_input_box_height);
    focusUserInput();
}

//user_input.focus()
function focusUserInput(){
    user_input.focus();
}

//입력창에 텍스트를 입력할때 실행
//입력된 텍스트의 길이에 따라 입력창의 크기를 조절
function userInputHandler(){ 
    setSendBtnStatus();

    input_box.style.height = input_box.scrollHeight - 20 + 'px';
    
    if(user_input.scrollHeight + 10 > input_box.scrollHeight)
        input_box.style.height = user_input.scrollHeight + 10 + 'px';
}

user_input.addEventListener('input', userInputHandler);

//엔터 키 입력 이벤트 처리
function enterKeyDownHandler(event){ 
    //enter 입력시 메시지 전송, shift + enter 입력시 개행
    if(event.key == 'Enter' && !event.shiftKey){ 
        event.preventDefault(); //개행 방지
        if(send_btn_activated)
            sendMsg(); //메시지 전송
    }
}

user_input.addEventListener('keydown', enterKeyDownHandler);
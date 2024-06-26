//chat_box 캡슐화

var chat_box = document.getElementById('chat_box');

//chat_box에 사용자/gpt 메시지 추가
function addMsgOnChatbox(msg, is_user){ //msg_cls : 'is_user == true -> 'user_msg' / is_user == false -> 'gpt_msg'
    //메시지 영역
    var msg_area = document.createElement('div');
    msg_area.className = 'msg_area';

    //메시지를 표시하기 위한 element 생성 (말풍선) (<div class=msg_cls></div>)
    var msg_element = document.createElement('div');

    if (is_user){
        msg_element.className = 'user_msg';
        msg_area.style.justifyContent = 'flex-end';
    }
    else
        msg_element.className = 'gpt_msg';

    //말풍선에 메시지 추가
    for(const line of msg.split('\n')){
        msg_element.innerHTML += line + '<br>';
    }

    //chat_box에 메시지 영역 추가, 메시지 영역에 말풍선 추가
    chat_box.appendChild(msg_area);
    msg_area.appendChild(msg_element);

    //텍스트 너비에 맞게 말풍선 너비 조정
    msg_element.style.width = msg_element.scrollWidth + 'px';
                   
    //말풍선의 폭을 일정 수준 이하로 조정
    var msg_element_max_width = chat_box.offsetWidth * 0.8;
    if (msg_element.offsetWidth > msg_element_max_width){
        //msg_element.style.overflow = 'hidden';
        msg_element.style.whiteSpace = 'normal';
        msg_element.style.width = msg_element_max_width + 'px';
    }

    //chat_box 스크롤 맨 아래로 이동
    chat_box.scrollTop = chat_box.scrollHeight;
}
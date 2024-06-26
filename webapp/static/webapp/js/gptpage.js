//chat gpt window 관련 js

var chat_gpt_window = null;

//chat gpt 버튼 클릭시 실행
//chat gpt 창 열기
function openChatGptWindow(event, href) {
    event.preventDefault();

    if(chat_gpt_window == null || chat_gpt_window.closed){ //chat gpt 채팅창이 존재하지 않는(또는 닫힌) 경우
        var windowWidth = 400;
        var windowHeight = 600;

        var leftPosition = (screen.width) ? (screen.width - windowWidth) / 2 : 0;
        var topPosition = (screen.height) ? (screen.height - windowHeight) / 2 : 0;
        var windowFeatures = 'width=' + windowWidth + ',height=' + windowHeight + ',top=' + topPosition + ',left=' + leftPosition;
    
        chat_gpt_window = window.open(href, 'popup', windowFeatures);
    }
    else{ //chat gpt 채팅창이 이미 열려 있는 경우 채팅창에 focus
        chat_gpt_window.focus();
    }
}

//chat gpt 창 닫기 (로그아웃 버튼 클릭시 실행)
function closeChatGptWindow(){
    chat_gpt_window.close();
}
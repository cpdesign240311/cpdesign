//msgsend.js : 메시지 전송 관련 js

let response_wait = false;  //서버로부터 응답 대기 여부

function getResponseWait(){
    return response_wait;
}

//메시지 전송
async function sendMsg(){
    //응답 대기중이라면 아무것도 하지 않고 종료
    if (response_wait == true) 
        return;

    //사용자가 입력한 메시지 불러오기
    var user_msg = getUserInputValue();

    //(개행 문자를 제외한)메시지가 공백이라면 종료
    if(user_msg.replace(/\n/g, '') == '')
        return;

    //채팅창에 사용자가 입력한 메시지 띄우고 입력칸 비우기
    addMsgOnChatbox(user_msg, true); //chat_box에 user_msg 추가
    emptyUserInput(); //user_input 비우기
    sendBtnDisable(); //전송 버튼 비활성화

    //명령 인식 -> user_msg의 첫번째 문자가 '/'일 때 user_msg = "(문서내용\n) + (user_msg[1:])"
    if(user_msg.trim().charAt(0) == '/'){
        user_msg = user_msg.trim().substring(1);
        
        //channel.js -> getDocumentData, 문서 내용 불러오기
        getDocumentData().then(async function(doc_data){
            user_msg = doc_data + '\n' + user_msg;
            //CHAT GPT 응답 받아와서 채팅창에 띄우기
            const gpt_response = await sendMsgToServer(user_msg);
            addMsgOnChatbox(gpt_response, false); //chat_box에 gpt_msg 추가
            return;
        }).catch(function(err){
            console.log("failed to read document data:", err);
            return;
        }) 
    }
    else{
        //CHAT GPT 응답 받아와서 채팅창에 띄우기
        const gpt_response = await sendMsgToServer(user_msg);
        addMsgOnChatbox(gpt_response, false); //chat_box에 gpt_msg 추가
        return;
    }
}

//Django 서버로 메시지 전송 및 응답 받기
async function sendMsgToServer(user_msg){
    response_wait = true;
    //setSendBtnStatus();
    sendBtnDisable();

    try{
        const response = await fetch("/gpt/chat/user_msg", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
            },
            body: JSON.stringify({'user_msg': user_msg})
        });

        if(response.ok){
            response_wait = false;
            setSendBtnStatus();
            const data = await response.json();
            return data.gpt_response;
        }
        else{
            throw new Error('response not ok');
        }                 
    } catch(error){
        console.error('Error:', error);
        return error;
    }
}
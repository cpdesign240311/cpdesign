var message = null;

function sendMessageToParent(targetOrigin,msg)
{
    if(!msg)
        msg = message;
    return window.parent.postMessage(msg,targetOrigin)
}

function initMessage(){
    message = {};
}

//메시지 타입
function setMsgType(type){
    if(message != null)
        message.type = type;
}

//메서드
function setMsgMethod(method){
    if(message != null)
        message.method = method;
}

//파라미터
function setMsgParam(param){
    if(message != null)
        message.param = param;
}

//데이터
function setMsgData(data){
    if(message != null)
        message.data = data;
}

function getMessage(){
    return message;
}
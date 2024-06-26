var socket = null;
var storageName = null;

function SocketInfo(groupId,userId){
    this.groupId = groupId;
    this.userId = userId;
    this.group = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/group/'
        + groupId + '-' + userId
        + '/'
    );
}

//소켓 연결 신뢰성 보장 -> 끊겼을 때 -> 재연결 
function reconnGroupSocket(){
    if(socket != null){
        let groupId = socket.groupId
        let userId = socket.userId;
        if(socket.group==null){
            socket.group = new WebSocket(
                'ws://'
                + window.location.host
                + '/ws/group/'
                + groupId + '-' + userId
                + '/'
            );
            return addSocketEvent();
        }
        else
            return false;
    }
}

//웹소켓 연결에 관한 js
function connGroupSocket(groupId,userId){
    socket = new SocketInfo(groupId,userId);
    if(socket!=null)
        return addSocketEvent();
}

function addSocketEvent(){
    let groupSocket = socket.group;
    if(groupSocket == null){
        console.log("소켓 생성 실패");
        return false;
    }
    
    //socket storage 초기화
    initStorage(socket.groupId);

    //메시지 불러와서 사용하는 코드
    groupSocket.onmessage = function(e) {
        let data = JSON.parse(e.data);
        let type = data.type;
        let message = data.message;
        let param = data.param;
        if(type=="method")
        {
            if(message=="loadList"){ //loadList 호출
                let url = param;
                window.loadList(url);
            }
            else if(message=='default'){ //defaultPage 이동
                let doc_name = message;
                let url = param;
                window.changeIframePage(url,doc_name);
            }
            else if(message=="change_permit"){
                let changedEmails = param.emails;
                let doc_name = param.doc_name;
                let url = param.url;
                //계정에 변경사항이 있는 경우 -> default 페이지 이동
                if(changedEmails.indexOf(socket.userId) != -1)
                    window.changeIframePage(url,doc_name);
            }
        }
        else if(type=="conn_broadcast"){
            addMember(message); //localStorage에 email 추가
            //message => 소켓에 연결한 대상 email ,  param => 메시지 받은 대상 email
            if(message != param)
            {
                let jsonString = JSON.stringify({
                    type : "notice",
                    message : message,
                    param : param,
                });
                sendMsgToSocket(jsonString);
            }
        }
        else if(type=='dconn_broadcast'){
            if(message == param){ //소켓 끊기 요청 보냈다면 
                delMemberList()
                dconnGroupSocket();
            } 
            else{
                delMember(message);
            }    
        }
        else if(type=="notice"){
            if(message == socket.userId){ //본인에게 온 메시지라면 정보추가
                addMember(param);
            }
        }
        //testcode
        //console.log("가져온 데이터 : "+type+" "+message+" "+param);
    };

    
    //소켓 열렸을 때 브로드 캐스트
    groupSocket.onopen = function(e) {
        let jsonString = JSON.stringify({
            type : 'conn_broadcast',
            message : socket.userId,
            param : 'none',
        });
        sendMsgToSocket(jsonString);
    };

    //소켓 닫힐 때
    groupSocket.onclose = function(e) {
        console.error('소켓이 닫힌 경우');
    };

    console.log("소켓이 생성됨");
    return true;
}

//메시지 보낼 때
function sendMsgToSocket(message){
    if(socket!=null){
        let groupSocket=socket.group
        if(groupSocket!=null)
            groupSocket.send(message);
        else
            console.log("소켓 연결 끊어짐; 전송 실패")    
    }
    else
        console.log("소켓 없음; 전송 실패")
}

function dconnBroadCast(){
    if(socket == null)
        return false;
    let jsonString = JSON.stringify({
        type : "dconn_broadcast",
        message : socket.userId,
        param : "none",
    });
    sendMsgToSocket(jsonString);
}

function dconnGroupSocket(){
    let jsonString = JSON.stringify({
        type : "disconnect",
        message : "none",
        param : "none",
    });
    sendMsgToSocket(jsonString);
    if(socket!=null){
        socket.group=null;
    }
}


/* 소켓 참여 목록 가져오기 위한 localStorage */
function initStorage(groupId){
    let data = new Array();
    storageName = 'SocGroup-'+groupId;
    localStorage.setItem(storageName,JSON.stringify(data));
}

//멤버 추가
function addMember(email){
    let arr=JSON.parse(localStorage.getItem(storageName));
    arr.push(email);
    let uniqueArr=new Set(arr.sort());
    let addArr=Array.from(uniqueArr);
    localStorage.setItem(storageName,JSON.stringify(addArr));
}

//멤버 삭제
function delMember(email){
    let arr=JSON.parse(localStorage.getItem(storageName));
    let delArr = arr.filter((e)=>e !== email).sort();
    localStorage.setItem(storageName,JSON.stringify(delArr));
}

//리스트 삭제
function delMemberList(){
    localStorage.removeItem(storageName);
    storageName=null;
}

//리스트 가져오기
function getMemberList(){
    let arr=JSON.parse(localStorage.getItem(storageName));
    console.log(arr.sort());
}

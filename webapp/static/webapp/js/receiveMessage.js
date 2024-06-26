//타입
function getMsgType(jsonString)
{
    return jsonString.type;
}

//메서드 가져오기
function getMsgMethod(jsonString)
{
    return jsonString.method;
}

//파라미터 가져오기
function getMsgParam(jsonString)
{
    return jsonString.param;
}

//데이터 가져오기
function getMsgData(jsonString)
{
    return jsonString.data;
}

//window 메시지 처리 관련 함수
function msgProcessingEvent(event){
    let type = getMsgType(event.data);
    if(type === 'method'){
        let method = getMsgMethod(event.data);
        let param = getMsgParam(event.data);
        if(method === 'loadList'){ //iframe의 문서 추가/삭제 시 발생
            let url = param;
            loadList(url);
        }
        else if(method === 'no_scroll')
            document.getElementById("mainFrame").setAttribute("scrolling","no");
        else if(method === 'scroll')
            document.getElementById("mainFrame").setAttribute("scrolling","auto");
        else if(method === 'conn_websoc'){ //그룹 입장 시 웹소켓 연결 요청
            let groupId = param;
            if(!connGroupSocket(groupId,userEmail))
                console.log("연결 실패");
        }
        else if(method === 'dconn_websoc'){
            dconnBroadCast();
            delDocList();
        }
        else if(method === 'add_doc'){ //문서 추가 이벤트 전달
            let message = param.message;
            param = param.url;
            let jsonString = JSON.stringify({
                type : "method",
                message : message,
                param : param,
            });
            sendMsgToSocket(jsonString);
        }
        else if(method=='redirect_mygroup'){ //강퇴되었을 때 처리
            document.getElementById("mygroupLink").click();
        }
        else if(method === 'del_doc'){ //문서 삭제 이벤트 전달
            let message = param.message;
            let url = param.url;
            let jsonString = JSON.stringify({
                type : "method",
                message : message,
                param : url,
            });
            sendMsgToSocket(jsonString);
        }
        else if(method === 'change_permit'){
            let emails = param.emails;
            let message = method;
            let url = param.url;
            let jsonString = JSON.stringify({
                type : type,
                message : message,
                param : {
                    emails : emails,
                    doc_name : param.message,
                    url : url,
                }
            });
            sendMsgToSocket(jsonString);
        }
        else if(method==="getUserID"){
            chatWindow.postMessage({userid : userEmail},"*");
        }
    }
    else if(type === 'data') { /*nothing*/ }
}
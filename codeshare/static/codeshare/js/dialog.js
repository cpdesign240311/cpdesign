const docAddBtn = document.getElementById("docAddBtn");
const docDelBtn = document.getElementById("docDelBtn");
const memListBtn = document.getElementById("memListBtn");
const memPermitBtn = document.getElementById("memPermitBtn");
const memAcceptBtn = document.getElementById("memAcceptBtn");

const docAddDialog = document.getElementById("docAddDialog");
const docDelDialog = document.getElementById("docDelDialog");
const memListDialog = document.getElementById("memListDialog");
const memAcceptDialog = document.getElementById("memAcceptDialog");
const memPermitDialog = document.getElementById("memPermitDialog");

//문서 생성
if(docAddBtn){
    docAddBtn.addEventListener('click',(event)=>{
        noScrollingOutside(true);
        docAddDialog.showModal();
    });
    
    docAddDialog.addEventListener('close',(event)=>{
        if (docAddDialog.returnValue === 'confirm') {    
            let url = new String(location.href).valueOf();
            let doc_name = document.getElementById("docAddName").value;
            let doc_type = document.querySelector('input[name="doc_type"]:checked').value;
            const post = { doc_name, doc_type };
            document.getElementById("docAddName").value="";
            document.getElementById("codeType").checked="checked";
            fetch(getHost()+"/codeshare/create_document", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
                },
                body: JSON.stringify(post)
            })
            .then(response => {
                if (response.ok) {
                    //소켓에 메시지 보내라고 전달
                    sendMessageToParent('*',{type : 'method', method : 'add_doc', param : { message : 'loadList', url : url }});
                    console.log("정상적으로 생성");
                } else {
                    console.log("문서 생성 실패");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        noScrollingOutside(false);
        event.stopImmediatePropagation(); //이벤트 전파 방지
    });
}

//문서 삭제
if(docDelBtn){
    docDelBtn.addEventListener('click',(event)=>{
        noScrollingOutside(true);
        docDelDialog.showModal();
    });
    
    docDelDialog.addEventListener('close',(event)=>{
        let url = new String(location.href).valueOf();
        if (docDelDialog.returnValue === 'confirm') {
            let doc_name = document.getElementById("docDelName").value;
            const post = { doc_name };
            document.getElementById("docDelName").value="";
            fetch(getHost()+"/codeshare/delete_document", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
                },
                body: JSON.stringify(post)
            })
            .then(response => {
                if (response.ok) {
                    sendMessageToParent('*',{type : 'method', method : 'del_doc', param : { message : "default", url : url }});
                    console.log("정상적으로 삭제");
                } else {
                    console.log("문서 삭제 실패");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        noScrollingOutside(false);
        event.stopImmediatePropagation(); //이벤트 전파 방지
    });
}

//접속자 목록 불러오기
function loadCurrMemberList(){
    let currMemList = document.getElementById("currMemList");
    currMemList.replaceChildren(); //모든 자식노드 삭제
    let group_id = document.getElementById("group_id").value;
    let key = "SocGroup-"+group_id;
    let list = JSON.parse(localStorage.getItem(key));
    let total = document.createElement("section");
    total.classList.add("currMember");
    total.innerText="접속자 수 : "+list.length+"명";
    currMemList.appendChild(total);
    list.forEach((member)=>{
        let mem = document.createElement("section");
        mem.classList.add("currMember");
        mem.innerText="->"+member;
        currMemList.appendChild(mem);
    });
}

memListBtn.addEventListener('click',(event)=>{
    loadCurrMemberList();
    noScrollingOutside(true);
    memListDialog.showModal();
});

//접속자 목록 대화상자 닫기 이벤트
function closeMemListDialog(){
    memListDialog.close();
    noScrollingOutside(false);
}

//멤버 권한
if(memPermitBtn){
    memPermitBtn.addEventListener('click',(event)=>{
        noScrollingOutside(true); //대화상자 실행 시 외부 스크롤 금지
        memPermitDialog.showModal();
    });

    //기존 permission 정보
    //write 권한만 비교
    let currentInfo = getPermissionInfo();

    //권한 적용 및 강퇴 처리
    memPermitDialog.addEventListener('close',(event)=>{
        let changedEmail=null;
        let url = new String(location.href).valueOf();
        if (memPermitDialog.returnValue === 'confirm') {
            let emails = getPermissionInfo();
            changedEmail = getChangedEmail(currentInfo,emails);
            const post = { emails };
            fetch(getHost()+"/webapp/manage_permission", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
                },
                body: JSON.stringify(post)
            })
            .then(response => {
                if (response.ok) {
                    location.reload();
                    console.log("적용 성공");
                } else {
                    console.log("적용 실패");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
            sendMessageToParent('*',{type : 'method', method : 'change_permit', param : { emails : changedEmail, message : 'default', url : url }});
        }
        noScrollingOutside(false); //외부 스크롤 해제
        event.stopImmediatePropagation(); 
    });
}

//PermissionInfo json 전처리
function getPermissionInfo(){
    let jsonData = {};
    const members = document.getElementsByClassName("member");
    const writableList = document.getElementsByClassName("writable");
    const banList = document.getElementsByClassName("ban");
    for(let i=0;i<members.length;++i){
        let key = members[i].innerText;
        let info = { "writable" : writableList[i].firstChild.checked?1:0, "ban" : banList[i].firstChild.checked?1:0};
        jsonData[key] = info;
    }
    return jsonData;
}

//변경된 email 목록 가져오기
function getChangedEmail(oldEmail, newEmail){
    let changedEmail = [];
    for (let email in oldEmail) {
        let o=Object.entries(oldEmail[email]).toString();
        let n=Object.entries(newEmail[email]).toString();
        if(o!==n) 
            changedEmail.push(email);
    }
    return changedEmail;
}

//멤버 승인
if(memAcceptBtn){
    memAcceptBtn.addEventListener('click',(event)=>{
        noScrollingOutside(true);
        memAcceptDialog.showModal();
    });
}

//accept 승인 option : accept/reject
function acceptMember(btn,option){
    const reqList = document.getElementById("reqList");
    let buttons = document.getElementsByClassName(option+" grpBtn checkBtn");
    let index = null;
    for(let i=0;i<buttons.length;++i){ //index 찾기
        if(buttons[i]===btn){
            index = i;
            break;
        }
    }
    let requester = document.getElementsByClassName("requester")[index].innerHTML;
    let reqDate = document.getElementsByClassName("reqDate")[index];
    let acceptBtn = document.getElementsByClassName("accept grpBtn checkBtn")[index];    
    let rejectBtn = document.getElementsByClassName("reject grpBtn checkBtn")[index];    
    const post = { requester, option}
    fetch(getHost()+"/webapp/accept_member", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
        },
        body: JSON.stringify(post)
    })
    .then(response => {
        if (response.ok) {
            location.reload();
            console.log("정상 동작");
        } else {
            console.log("실패");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//accept 대화상자 닫기 이벤트
function closeMemAcceptDialog(){
    memAcceptDialog.close();
    noScrollingOutside(false);
}

//외부 스크롤 금지
function noScrollingOutside(option){
    //home에 iframe 스크롤 명령
    initMessage();
    setMsgType("method");
    setMsgMethod(option?"no_scroll":"scroll");
    setMsgParam('none');
    sendMessageToParent('*');
    if(option){
        document.documentElement.classList.add('.scrollCtrl');    
        document.body.classList.add('.scrollCtrl');
    }
    else{
        document.documentElement.classList.remove('.scrollCtrl');    
        document.body.classList.remove('.scrollCtrl');
    }
}



//메시지 종류
var msgType = null;
//메시지 대화상자
const msgDialog = document.getElementById("msgDialog");

//해당 메시지를 클릭하면 닫는 이벤트 
msgDialog.addEventListener('click', function (event) {
    const target = event.target;
    const rect = target.getBoundingClientRect();
    if (rect.left < event.clientX &&
        rect.right > event.clientX &&
        rect.top < event.clientY &&
        rect.bottom > event.clientY) 
    {
      msgDialog.close();
    }
})

//대화상자 메시지
function showMsg(message){
  msgDialog.innerText=message;
  msgDialog.showModal();
}

//그룹 강퇴 처리
function kickOut(){
    msgType = "kick";
    showMsg("강퇴되었습니다.");
}

//메시지 닫힐 때 처리할 이벤트
msgDialog.addEventListener('close',()=>{
    switch(msgType){
        case "kick":
            sendMessageToParent("*",{type:"method",method:"redirect_mygroup",param:"none"});
            break;
        default:
            break;
    }
});
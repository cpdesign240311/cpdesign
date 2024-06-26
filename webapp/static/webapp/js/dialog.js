const addBtn = document.getElementById("grpAddBtn");
const delBtn = document.getElementById("grpDelBtn");

const grpAddDialog = document.getElementById("grpAddDialog");
const grpDelDialog = document.getElementById("grpDelDialog");

const grpAccessDialog = document.getElementById("grpAccessDialog");

/* 그룹 추가 대화상자 */
addBtn.addEventListener('click', () => {
  grpAddDialog.showModal();
})

grpAddDialog.addEventListener('close', (event) => {
  if (grpAddDialog.returnValue === 'confirm') {
    addGroup();
  }
  //초기화
  let name = document.getElementById("grpName");
  let pwd = document.getElementById("grpAddPwd");
  name.value="";
  pwd.value="";
})

/* 그룹 삭제 대화상자 */
delBtn.addEventListener('click', () => {
  grpDelDialog.showModal();
})

grpDelDialog.addEventListener('close', (event) => {
  if (grpDelDialog.returnValue === 'confirm') {
    delGroup();
  }
  let id = document.getElementById("grpId");
  let pwd = document.getElementById("grpDelPwd");
  id.value="";
  pwd.value="";
})

//메시지 대화상자
let msgDialog = document.getElementById("msgDialog");
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

//대화상자 메시지 생성
function showMsg(message){
  msgDialog.innerText=message;
  msgDialog.showModal();
}

//그룹 페이지로 이동
function entryGroup(action,groupId,password){
  let form = document.createElement("form");
  form.setAttribute("id","hform");
  form.setAttribute("charset","UTF-8");
  form.setAttribute("method","post");
  form.setAttribute("action",action);

  let hiddenField = document.createElement("input");
  hiddenField.setAttribute("type","hidden");
  hiddenField.setAttribute("name","groupId");
  hiddenField.setAttribute("value",groupId);
  form.appendChild(hiddenField);
  
  hiddenField = document.createElement("input");
  hiddenField.setAttribute("type","hidden");
  hiddenField.setAttribute("name","password");
  hiddenField.setAttribute("value",password);
  form.appendChild(hiddenField);

  //django crsf
  hiddenField = document.createElement("input");
  hiddenField.setAttribute("type","hidden");
  hiddenField.setAttribute("name","csrfmiddlewaretoken");
  hiddenField.setAttribute("value",getCookie('csrftoken'));
  form.appendChild(hiddenField);
  
  document.body.appendChild(form);
  form.submit();

  //웹소켓 연결 요청 수행
  initMessage();
  setMsgType('method');
  setMsgMethod('conn_websoc');
  setMsgParam(groupId);
  sendMessageToParent('*');

  document.getElementById("hform").remove();
}
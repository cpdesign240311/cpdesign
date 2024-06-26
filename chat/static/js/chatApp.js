var isRequesting = false;

function getUserId(){
  return new Promise(function(resolve, reject){
      isRequesting = true;

      function handleMessage(e){
        userName = e.data.userid 
        resolve(userName);
      }
      //윈도우에 메시지 핸들러 추가
      window.addEventListener("message", handleMessage);

      //키보드 이벤트
      document.getElementById("chatText").addEventListener("keydown",(e)=>{
        if(e.key == 'Enter' && !e.shiftKey){ 
          send();
          e.preventDefault(); //이중 실행 막기
        }
      });

      //기본 포커싱
      send();
      
      //userID get
      window.opener.postMessage({type:"method",method:"getUserID",param:"none"},"*");


      // 타임아웃 설정
      setTimeout(function() {
          if (isRequesting) {
              window.removeEventListener("message", handleMessage);
              isRequesting = false;
              reject("userID를 가져오지 못했습니다.");
          }
      }, 3000);
  });
}

var socket = io();

//소켓 연결되었을 때 userID를 가져오도록 변경했습니다
socket.on('connect', function() {
  let name = null;
  /* !!여기서 이름을 받아와서 사용해야합니다. name에다가 그냥 이름을 주면 됩니다. */
  getUserId().then(async(data)=>{
      //resolve
      name = data;
      socket.emit('newUser', name);
  }).catch(function(err){
      //reject
      console.log("failed to get userId :", err);
      name="익명";
      /* 이름을 넘겨줍니다. (중요) */
      socket.emit('newUser', name);
  });
});


socket.on('update', function(data) {
  var chat = document.getElementById('chat')
  var message = document.createElement('p')

  //상대방에게 보여질 메시지 형식 지정 부분
  var node = document.createTextNode(`${data.name}: ${data.message}`)
  
  //현재 스크롤이 위에 있는지 판단
  //scrollHeight : 전체 영역 세로 길이(스크롤바 전체 길이로 취급)
  //clientHeight : 보이는 영역 세로 길이(움직이는 막대바로 취급)
  //scrollTop : 스크롤의 현재 위치
  //20 : 마진값
  //이전 메시지를 읽고 있는지 여부 판단
  let isReadPostMsg = false;
  if(chat.scrollTop < chat.scrollHeight - (chat.clientHeight + 20))
    isReadPostMsg = true; //읽고 있는 경우

  var className = 'other'
  message.classList.add(className)
  message.appendChild(node)
  chat.appendChild(message)
  chat.appendChild(document.createElement("br"));
  
  if(!isReadPostMsg) //스크롤이 최하단에 있던 경우
    chat.scrollTop=chat.scrollHeight; //스크롤 위치 갱신
});


/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  let message = document.getElementById('chatText').value;
  let chatText = document.getElementById('chatText');
  if(!message == "") {
    var chat = document.getElementById('chat')
    var msg = document.createElement('p')
    var node = document.createTextNode(message)
    msg.classList.add('me')
    msg.appendChild(node)
    
    chat.appendChild(msg)
    chat.appendChild(document.createElement("br"));

    socket.emit('message', {type: 'message', message: message})
    chatText.value = "";
    chatText.focus();
    chat.scrollTop=chat.scrollHeight; //스크롤 하단으로 이동
  }
  chatText.focus();
}
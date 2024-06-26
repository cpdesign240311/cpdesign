//login.js
//login.html

var form_input = [['userID', 'password']];            
//var form_message = [['userIDMessage', 'passwordMessage']];

window.addEventListener("load", function(event){ //onLoadHander 추가
    onLoadHandler(form_input);
});

for (var i = 0; i < 2; i++){ //각각의 입력 칸에 onFocusHandler, onBlurHandler 추가
    (function(){
        var inputField = document.getElementById(form_input[0][i]);
        var inputLabel = document.getElementById(form_input[0][i] + "Label");
        var inputMessage = document.getElementById(form_input[0][i] + "Message");

        inputField.onfocus = function(event){
            onFocusHandler(inputField, inputLabel, inputMessage);
        };
        inputField.onblur = function(event){
            onBlurHandler(inputField, inputLabel, inputMessage);
        };
    })();    
}

var submitBtn = document.getElementById("sign_in");         
submitBtn.addEventListener("mouseover", btnMouseOver);  //확인 버튼 위에 마우스 위치시킬때 색 바꾸기
submitBtn.addEventListener("mouseout", btnMouseOut);  //확인 버튼에서 마우스가 벗어날때 색 바꾸기

var form = document.getElementById("f0");  //submit event handler 추가
form.addEventListener("submit", function(event){
    submitHandler(form_input, event);
});
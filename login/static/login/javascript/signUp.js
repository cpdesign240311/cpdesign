//signUp.js
//sign_up.html

var form_input = [['userID'], ['verification'], ['password', 'passwordConfirm'], ['userName']];            
//var form_message = [['userIDMessage'], ['verificationMessage'], ['passwordMessage', 'passwordConfirmMessage'], ['userNameMessage']];

window.addEventListener("load", function(event){ //onLoadHander 추가
    onLoadHandler(form_input);
});
    
for (var i = 0; i < form_input.length; i++){ //각각의 입력 칸에 onFocusHandler, onBlurHandler 추가
    for (var j = 0; j < form_input[i].length; j++){
        (function(){
            var inputField = document.getElementById(form_input[i][j]);
            var inputLabel = document.getElementById(form_input[i][j] + "Label");
            var inputMessage = document.getElementById(form_input[i][j] + "Message");
    
            inputField.onfocus = function(event){
                onFocusHandler(inputField, inputLabel, inputMessage);
            };
            inputField.onblur = function(event){
                onBlurHandler(inputField, inputLabel, inputMessage);
            };
        })();    
    }
}

history.replaceState(null, null, location.href); //뒤로가기 막기
window.addEventListener('popstate', function(event) {
    history.replaceState(null, null, location.href);
});

var submitBtns = document.getElementsByClassName("submit_btn");   // 버튼 위에 마우스 위치 시킬 때 색상 변경
Array.from(submitBtns).forEach((btn) => {
    btn.addEventListener("mouseover", btnMouseOver)
    btn.addEventListener("mouseout", btnMouseOut)
});  

var forms = document.getElementsByClassName("f"); //submit event handler 추가
Array.from(forms).forEach((form) => {
    form.addEventListener("submit", function(event){
        submitHandler(form_input, event);
    })
}); 
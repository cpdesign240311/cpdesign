//eventHandler.js

function onFocusHandler(element, label, message){ //입력 칸이 focus된 경우
    element.placeholder = "";
    label.style.visibility = "visible";
    message.style.visibility = "hidden";
}

var can_submit = 0; // can_submit == 0 : submit 가능, can_submit != 0 : submit 불가능

function onBlurHandler(element, label, message){ //입력 칸이 focus 해제된 경우 -> 유효성 체크
    switch (element.id){
        case "userID":
            var check = userIdCheck(element.value);
            break;
        case "password":
            var check = passwordCheck(element.value);
            pwConf = document.getElementById("passwordConfirm");
            if (pwConf == null || pwConf.value == "")
                break;
            pwConfLabel = document.getElementById("passwordConfirmLabel");
            pwConfMessage = document.getElementById("passwordConfirmMessage");
            displayCheckResult(passwordConfirmCheck(pwConf.value, element.value), pwConf, pwConfLabel, pwConfMessage);
            break;
        case "passwordConfirm":
            var check = passwordConfirmCheck(element.value, document.getElementById("password").value);
            break;
        case "verification":
            var check = verificationCheck(element.value);
            break;
        case "userName":
            var check = userNameCheck(element.value);
            break;
        default:
            console.log("invalid element's id");
            return;
    }

    displayCheckResult(check, element, label, message);
}

function displayCheckResult(check, element, label, message){ //유효성 확인 결과를 표시 (입력칸 테두리 색 바꾸기, message 출력 등)
    if (check[0] == 0){ //입력값이 유효성 만족
        element.style.borderColor = "green";
        message.style.visibility = "hidden";

        //can_submit += 0;
        return;
    }

    //유효성을 만족하지 않는 경우
    element.style.borderColor = "red";

    if (check[0] == 1){ //입력되지 않음 (공백 입력)
        element.placeholder = label.textContent;
        label.style.visibility = "hidden";   //label 가리기
    }
    message.textContent = check[1];
    message.style.visibility = "visible";

    can_submit += 1;
    return;
}

/*
function onPwBlur(pw, pwConf, pwConfMsg){  //pw focus 해제된 경우 pw confirm의 일치 여부 체크 필요 (회원가입 시)
    if (pwConf.value === "")
        return

    if (pw.value == pwConf.value){
        pwConf.style.borderColor = 'green';
        pwConfMsg.style.visibility = 'hidden';
    }
    else {
        pwConf.style.borderColor = 'red';
        pwConfMsg.textContent = "비밀번호가 일치하지 않습니다";
        pwConfMsg.style.visibility = 'visible';
    }
}*/

function btnMouseOver(event){ //버튼 위에 마우스 위치시킬때 색 바꾸기
    this.style.backgroundColor = "rgb(52, 82, 179)";
}

function btnMouseOut(event){ //버튼에서 마우스가 벗어날 때 색 원래대로 바꾸기
    this.style.backgroundColor = "rgb(65, 105, 225)";
}

function onLoadHandler(form_input){ //페이지가 load될 때
    var forms = document.getElementsByClassName("f"); //모든 폼 가리기
    Array.from(forms).forEach((form) => {
        form.style.display = "none";
    });
    document.getElementById("f" + form_num).style.display = "block"; //현재 폼 보여주기   

    for (var i = 0; i < form_input[form_num].length; i++){
        if (input.length <= i)
            break;
        if (input[i] == "none")
            continue;

        var element = document.getElementById(form_input[form_num][i]); //기존 입력값 입력

        element.onfocus();
        element.value = input[i];
        element.onblur();           

        if (messages != "none" && messages[i] != "none"){
            var msgElement = document.getElementById(form_input[form_num][i] + "Message"); //메시지 있으면 출력
            msgElement.textContent = messages[i];
            msgElement.style.visibility = "visible";
            element.style.borderColor = "red";
        }
    }            
}

function submitHandler(form_input, event){ //submit 이벤트 처리
    can_submit = 0;
    
    for(var i = 0; i < form_input[form_num].length; i++){
        document.getElementById(form_input[form_num][i]).onblur();
    }

    if (can_submit == 0){
        console.log("submit");
    }
    else{
        console.log("submit denied");
        event.preventDefault();
    }
}
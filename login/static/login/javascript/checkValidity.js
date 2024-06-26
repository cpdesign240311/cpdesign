//checkValidity.js
//입력값의 형식 유효성 체크

function isEmptyInput(data){ //입력값이 공백인지 확인
    if (data === '')
        return true;
    return false;
}

function isValidEmail(email){ //이메일 형식 유효성 체크
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //이메일 형식 regex
    return emailRegex.test(email);
}

function isValidPassword(password){ //비밀번호 형식 유효성 체크
    //if (password === '')
    //    return false;     //일단 공백인 경우에만 false 반환, 추후 비밀번호 규칙이 정해지는 경우 수정
    return true;
}


//입력값이 유효한지 확인
//반환 형식 : [(유효성 여부), (메시지)]
//유효성 여부 | 0 : 이상 없음, 1 : 공백 입력, 2 : 기타

function userIdCheck(id){ //아이디 유효성 체크
    if (isEmptyInput(id))
        return [1, "이메일을 입력하세요"];
    if (!isValidEmail(id))
        return [2, "이메일 형식이 올바르지 않습니다"];
    return [0];
}

function passwordCheck(password){ //비밀번호 유효성 체크
    if (isEmptyInput(password))
        return [1, "비밀번호를 입력하세요"];
    if (!isValidPassword(password))
        return [2, "비밀번호 형식이 올바르지 않습니다"];
    return [0];
}

function passwordConfirmCheck(pwConfirm, pw){ //비밀번호 확인 유효성 체크
    if (isEmptyInput(pwConfirm))
        return [1, "비밀번호를 재입력하세요"];
    if (pwConfirm !== pw)
        return [2, "비밀번호가 일치하지 않습니다"];
    return [0];
}

function verificationCheck(verification){ //인증 코드 유효성 체크
    if (isEmptyInput(verification))
        return [1, "인증 코드를 입력하세요"];
    return [0];
}

function userNameCheck(userName){ //유저 네임 유효성 체크
    if (isEmptyInput(userName))
        return [1, "사용자 이름을 입력하세요"];
    return [0];
}
from login.models import User
from . import pwHash, signUpManager
import re

def isEmptyInput(data): #입력값이 공백인지 확인
    if data == "":
        return True
    return False

def isValidEmail(email): #이메일 형식 유효성 체크
    emailRegex = '^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$' #이메일 형식 체크를 위한 regex
    if not re.search(emailRegex, email):
        return False
    return True

def isUserExist(id): #DB에 해당 id(email)을 가진 사용자가 존재하는지 확인
    return User.objects.filter(email = id).exists()

def isValidPassword(pw): #비밀번호 형식 유효성 체크
    return True

#입력된 데이터 유효성 체크
#반환형식 : (validity, message)
#validity : False(유효하지 않음), True(유효함)

def userIdCheck(id, userShouldBeExist):
    if id == "none":
        return (False, "none")
    
    if isEmptyInput(id):
        return (False, "이메일을 입력하세요")
    if not isValidEmail(id):
        return (False, "이메일 형식이 올바르지 않습니다")
    if isUserExist(id) and not userShouldBeExist:
        return (False, "중복되는 이메일이 이미 존재합니다")
    elif not isUserExist(id) and userShouldBeExist:
        return (False, "사용자가 존재하지 않습니다")
    '''
    if userShouldBeExist and not isUserExist(id): #(true, false)
        return "사용자가 존재하지 않습니다"
    if not userShouldBeExist and isUserExist(id): #(false, true)
        return "중복되는 이메일이 이미 존재합니다"
    '''
    return (True, "none")

def passwordCheck(pw, userPw=None): #pw : 사용자가 입력한 패스워드, userPw : DB의 User 테이블에 저장된 패스워드
    if pw == "none":
        return (False, "none")
    
    if isEmptyInput(pw):
        return (False, "비밀번호를 입력하세요")
    if not isValidPassword(pw):
        return (False, "비밀번호 형식이 올바르지 않습니다")
    if userPw != None and not pwHash.comparePW(pw, userPw):
        return (False, "비밀번호가 일치하지 않습니다")
    
    return (True, "none")

def passwordConfirmCheck(pwConf, pw):
    if pwConf == "none":
        return (False, "none")
    
    if isEmptyInput(pwConf):
        return (False, "비밀번호를 재입력하세요")
    if pwConf != pw:
        return (False, "비밀번호가 일치하지 않습니다")

    return (True, "none")

def verificationCheck(code):
    if code == "none":
        return (False, "none")
    
    if isEmptyInput(code):
        return (False, "인증 코드를 입력하세요")
    if not signUpManager.isCorrectVerificationCode(code):
        return (False, "코드가 일치하지 않습니다")
    
    return (True, "none")

def userNameCheck(name):
    if name == "none":
        return (False, "none")
    
    if isEmptyInput(name):
        return (False, "사용자 이름을 입력하세요")
    
    return (True, "none")
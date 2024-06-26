# 회원가입시 필요한 데이터 관리

from login.models import User
from . import pwHash
import random
from django.core.mail import EmailMessage, send_mail

#회원가입을 위한 데이터
sign_up_form_num = 0
verification_code = "" #이메일 주소 새로 입력시 랜덤 인증코드 생성
email_verified = False #이메일 주소 새로 입력시 False로 초기화, 인증 성공 시 True
user_data = {'id': None, 'pw': None, 'name': None}

def resetSignUpData(): #회원가입 관련 데이터 초기화
    global sign_up_form_num
    global verification_code
    global email_verified
    global user_data

    sign_up_form_num = 0
    verification_code = "" #이메일 주소 새로 입력시 랜덤 인증코드 생성
    email_verified = False #이메일 주소 새로 입력시 False로 초기화, 인증 성공 시 True
    user_data = {'id': None, 'pw': None, 'name': None}

def getFormNum():
    global sign_up_form_num
    return sign_up_form_num

def nextForm():
    global sign_up_form_num
    sign_up_form_num += 1

def addUserData(item, value): #user_data에 데이터 추가 / item : 'id', 'pw', 'name' / value : item에 해당하는 값
    global user_data
    user_data[item] = value

def generateVerificationCode(): #이메일 인증 코드 생성
    global verification_code

    code = ""
    for _ in range(6):
        code += str((random.randrange(10)))
    #return code
    verification_code = code

def sendVerificationCode(addr): #이메일 인증 코드 송신
    global verification_code
    sender_addr = "cpdesign425@gmail.com"

    title = "인증코드"
    message = "인증 코드 " + verification_code + "를 입력하세요"

    #email = EmailMessage(title, message, sender_addr, to=[addr])
    #email.send()
    send_mail(title, message, sender_addr, [addr])
    print(addr, message) #일단 콘솔에 인증코드 출력 (이메일 전송 기능 나중에 구현)

def isCorrectVerificationCode(code): #사용자가 입력한 인증 코드의 일치 여부 확인
    global verification_code
    global email_verified

    if code == verification_code:
        email_verified = True
    else:
        email_verified = False

    return email_verified

def register(): #사용자 데이터 db에 추가
    global email_verified
    global user_data

    if not email_verified:
        return (False, "email does not verified")
    
    if user_data['id'] == None or user_data['pw'] == None or user_data['name'] == None:
        return (False, "user data error")
    
    if User.objects.filter(email = user_data['id']).exists(): #중복되는 아이디 존재
        return (False, "not unique id")

    new_user = User(email = user_data['id'], password = pwHash.generateHashedPW(user_data['pw']), name = user_data['name'])
    new_user.save()
    return (True, "register success")

def updatePw(): #패스워드 변경
    global email_verified
    global user_data

    if not email_verified:
        return (False, "email does not verified")
    
    if user_data['id'] == None or user_data['pw'] == None:
        return (False, "user data error")
    
    user = User.objects.filter(email = user_data['id']) #db에서 user 조회

    if not user.exists(): #아이디가 존재하지 않음
        return (False, "id is not exist")
    
    user.update(password = pwHash.generateHashedPW(user_data['pw']))

    return (True, "update password success")
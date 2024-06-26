# 패스워드 해시
# DB에 저장하기 위한 패스워드 해쉬값 + 솔트 데이터 생성
# 사용자가 입력한 패스워드와 DB에 저장된 패스워드의 일치 여부 판단

import hashlib
import secrets

def generateSalt(): #16자리(8byte)의 랜덤 salt 값 생성
    salt = secrets.token_hex(8)
    return salt

def hashPW(pw, salt): #비밀번호 해쉬
    h = hashlib.sha256() #SHA-256 사용

    h.update((pw + salt).encode('utf-8'))

    return h.hexdigest()

def generateHashedPW(pw): #비밀번호 해쉬값 + 솔트 데이터 생성
    salt = generateSalt()
    pw_hash = hashPW(pw, salt)
    return pw_hash + '$' + salt

def comparePW(input_pw, hashed_pw): #비밀번호 일치 여부 확인
    #answer = hashed_pw.split('$')[0]
    #salt = hashed_pw.split('$')[1]
    answer, salt = hashed_pw.split('$')
    
    if hashPW(input_pw, salt) == answer:
        return True
    else:
        return False
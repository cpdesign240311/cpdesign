from django.shortcuts import render, redirect
#from django.http import HttpResponse
#from django.core.mail import EmailMessage
#from django.utils import timezone

from login.models import User
from .utils import checkValidity, signUpManager

# Create your views here.

#로그인
def login(request):  
    if request.session.get('user') != None: #이미 로그인 된 상태인 경우 webapp 페이지로 이동
        return redirect('/webapp') 

    signUpManager.resetSignUpData() #회원가입 관련 데이터 초기화
    
    id = request.POST.get('userID')
    pw = request.POST.get('password')
    if id == None: id = "none"
    if pw == None: pw = "none"

    id_valid, idMsg = checkValidity.userIdCheck(id, userShouldBeExist=True)

    user, userPw = None, None
    if id_valid:
        user = User.objects.get(email = id)
        userPw = user.password

    pw_valid, pwMsg = checkValidity.passwordCheck(pw, userPw)

    if id_valid and pw_valid:      #id와 pw가 유효함 -> 로그인 성공       
        request.session['user'] = { 'email' : user.email, 'name' : user.name }
        return redirect('/webapp') #webapp 페이지로 이동
    else:
        return render(request, './login/login.html', { 'form_num' : 0, 'input': [id, pw], 'messages' : [idMsg, pwMsg] })

#로그아웃
def signOut(request):
    del request.session['user']
    return redirect('/login')

#회원가입
def signUp(request):
    if signUpManager.getFormNum() == 0:
        context = signUpForm0(request)
    elif signUpManager.getFormNum() == 1:
        context = signUpForm1(request)
    elif signUpManager.getFormNum() == 2:
        context = signUpForm2(request)
    elif signUpManager.getFormNum() == 3:
        context = signUpForm3(request)

    return render(request, './login/sign_up.html', context)

def signUpForm0(request, userShouldBeExist=False):
    signUpManager.resetSignUpData()

    id = request.POST.get('userID')
    if id == None: id = "none"
    id_valid, message = checkValidity.userIdCheck(id, userShouldBeExist)

    if id_valid:
        signUpManager.addUserData('id', id)
        signUpManager.generateVerificationCode()
        signUpManager.sendVerificationCode(id)
        signUpManager.nextForm()
        id = 'none'
    
    context = { 'form_num': signUpManager.getFormNum(), 'input': [id], 'messages' : [message] }
    return context

def signUpForm1(request):
    code_ans = request.POST.get('verification')
    if code_ans == None: code_ans = "none"
    code_valid, message = checkValidity.verificationCheck(code_ans)

    if code_valid:
        signUpManager.nextForm()
        code_ans = 'none'

    context = { 'form_num': signUpManager.getFormNum(), 'input': [code_ans], 'messages' : [message] }
    return context

def signUpForm2(request):
    pw = request.POST.get('password')
    pw_confirm = request.POST.get('passwordConfirm')
    if pw == None: pw = "none"
    if pw_confirm == None: pw_confirm = "none"

    pw_valid, pwMsg = checkValidity.passwordCheck(pw)
    pwConf_valid, pwConfirmMsg = checkValidity.passwordConfirmCheck(pw_confirm, pw)

    if pw_valid and pwConf_valid:
        signUpManager.addUserData('pw', pw)
        signUpManager.nextForm()
        pw = "none"
        pw_confirm = "none"

    context = { 'form_num': signUpManager.getFormNum(), 'input': [pw, pw_confirm], 'messages' : [pwMsg, pwConfirmMsg] }
    return context

def signUpForm3(request):
    name = request.POST.get('userName')
    if name == None: name = "none"

    name_valid, nameMsg = checkValidity.userNameCheck(name)

    if name_valid:
        signUpManager.addUserData('name', name)
        register_succeed, msg = signUpManager.register()
        if register_succeed: #회원가입 성공
            signUpManager.nextForm()
            print(msg)
        else:
            #회원가입 실패
            print(msg)
        name = 'none'

    context = { 'form_num': signUpManager.getFormNum(), 'input': [name], 'messages' : [nameMsg] }
    return context

#비밀번호 재설정
def pwReset(request):
    if signUpManager.getFormNum() == 0:
        context = signUpForm0(request, True) #user should be exist
    elif signUpManager.getFormNum() == 1:
        context = signUpForm1(request)
    elif signUpManager.getFormNum() == 2:
        context = signUpForm2(request)
        if signUpManager.getFormNum() == 3:
            succeed, msg = signUpManager.updatePw()
            if succeed: #비밀번호 변경 성공 (form 3)
                print(msg)
            else: #비밀번호 변경 실패 (form 4)
                signUpManager.nextForm()
                context['form_num'] += 1
                print(msg)

    return render(request, './login/reset_password.html', context)
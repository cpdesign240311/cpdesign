from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
import json

from . import openAIModule as gpt

# Create your views here.

#새로운 채팅창 띄우기
def initChatPage(request):
    #로그인 되지 않은 경우 로그인 페이지로 이동
    user = request.session.get('user')
    if user == None:
        #return HttpResponse("로그인 후 이용해 주세요")
        return redirect('/login')

    #해당 세션의 채팅 로그 초기화
    request.session['gpt_chat_log'] = []

    return render(request, './gpt/chat_page.html')

#유저로부터 전달받은 메시지 처리
def handleUserMsg(request):
    if request.session.get('user') == None:
        return JsonResponse({'gpt_response': "로그인 후 이용해 주세요"})

    if request.method == 'POST':
        #전송받은 데이터로부터 user_msg 읽기
        data = json.loads(request.body.decode('utf-8'))
        user_msg = data.get('user_msg')

        #openAIModule에 user_msg와 채팅 로그 전달 후 응답 받기
        #gpt_response, gpt_chat_log = gpt.getResponse(user_msg, request.session.get('gpt_chat_log'))
        gpt_response, additional_chat_log = gpt.getResponse(user_msg, request.session.get('gpt_chat_log'))

        #채팅 로그 업데이트
        request.session['gpt_chat_log'] += additional_chat_log
        
        return JsonResponse({'gpt_response': gpt_response})
    else:
        return HttpResponse('Invalid request method')

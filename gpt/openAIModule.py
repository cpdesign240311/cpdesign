from openai import OpenAI

client = OpenAI(api_key = "sk-proj-7UXAq2veKuHxdrsJknhsT3BlbkFJZxpOAepklECqjANmcHba")
model = "gpt-3.5-turbo"
gpt_role_assign = [{"role": "system", "content": "당신은 소규모 팀에서 사용되는 실시간 문서 및 코드 편집을 위한 프로젝트(LCD)의 어시스턴트입니다."}]

chatLogMaxLen = 6 #채팅 로그에 저장할 메시지 수

#chat gpt로부터 응답 받기
def getResponse(user_msg, chat_log):
    if user_msg.replace('\n', '') == '':
        return ''
    
    #chat_log에 user_msg 추가
    chatLogAppend(chat_log, 'user', user_msg)

    completion = client.chat.completions.create(
        model = model,
        messages = gpt_role_assign + chat_log
    )

    #chat_log에 gpt 응답 추가
    chatLogAppend(chat_log, completion.choices[0].message.role, completion.choices[0].message.content)

    #gpt 응답과 chat_log 반환
    return completion.choices[0].message.content, chat_log[-2 : chatLogMaxLen]

#chat_log에 메시지 추가하기
def chatLogAppend(chat_log, role, content):
    chat_log += [{"role": role, "content": content}]
    
    if len(chat_log) > chatLogMaxLen:
        del chat_log[0]

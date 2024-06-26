from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.db.models import Q
from .models import Document, Doc_user_permission
from login.models import User

from .models import Group, Grp_user_permission, Grp_join_request
from codeshare.models import Document
from codeshare.views import load_documents, removeDocFromYorkie

from login.utils import pwHash
import json
import re

# Create your views here.

#로그아웃
def signOut(request): 
    return redirect("/login/sign_out") #webapp/sign_out -> login/sign_out

def webapp(request):
    #global user
    user = request.session.get('user')

    if user == None: #로그인되지 않은 경우 로그인 페이지로 이동
        return redirect('/login')

    '''
    doc_list = "title      | owner          | created date        | modified date\n"
    doc_list += "------------------------------------------------------------------------\n"
    documents = Document.objects.all() #SELECT * FROM document
    for doc in documents:
        created_date = doc.created_date.strftime("%Y-%m-%d %H:%M:%S")
        modified_date = doc.modified_date.strftime("%Y-%m-%d %H:%M:%S")
        doc_list += "{:<10} | {:<14} | {} | {}\n".format(doc.title, doc.owner.email, created_date, modified_date)
        #doc_list += f"{doc.title:<10} | {doc.owner:<14} | {created_date} | {modified_date} \n"
    
    response = user['name'] + "(" + user['email'] + ")\n\n" + doc_list
    return HttpResponse(response, content_type='text/plain')
    '''

    #POST 요청이라면
    if request.method == 'POST':
        page = 'MyGroup'
    else:
        page = None

    context = { 'username' : user['name'], 'email' : user['email'], 'page' : page }
    return render(request, './webapp/home.html', context)

#doc -> group 수정
#본인이 가입되어있는 그룹 목록을 가져옴
#forum -> mygroup
def mygroup(request):
    user = request.session.get('user')

    readable_grp_id = Grp_user_permission.objects.filter(user_id = user['email'], readable = True).values_list('group_id', flat = True) 
    #SELECT doc_id FROM doc_user_permission WHERE user_id = user['email'] and readable = True
    grp_info = Group.objects.filter(group_id__in = readable_grp_id).values('group_id', 'title', 'owner', 'created_date')
    #SELECT title, owner, created_date FROM document WHRER doc_id in readable_doc_id

    #reload시 가져올 수 있는 이벤트
    group = request.session.get('group')
    #그룹 세션 활성화 여부
    isExistGrp = "Exist"
    if group!=None:
        isExistGrp = "Not Exist"

    context = {}
    #documents = Document.objects.all() #SELECT * FROM document

    if group != None:
        docs = Document.objects.filter(group_id__in = group['group_id']).values('group_id','doc_name','doc_type')
        param = {'grp_info': grp_info, 'isExistGrp' : isExistGrp, 'title' : group['title'], 'docs' : docs } 
        context = param
    else :
        param = {'grp_info': grp_info, 'isExistGrp' : isExistGrp} 
        context = param

    return render(request, './webapp/mygroup.html', context)

#가입되어있지 않은 그룹 목록을 가져옴
def forum(request): 
    user = request.session.get('user')
    #로그인 풀린 경우 에러페이지 이동
    if user==None:
        return render(request, './webapp/error.html', context)

    page_num = None
    #POST 요청인 경우
    if request.method == 'POST':
        page_num = int(request.POST.get('page_num'))
        grp_keyword = request.POST.get('grp_keyword') #그룹 검색어
    else:
        page_num=1     #GET 요청일 때 기본 page수 1로 취급
        grp_keyword = '' #GET 요청일 때 기본 그룹 검색어 공백
    
    readable_grp_id = Grp_user_permission.objects.filter(user_id = user['email'], readable = True).values_list('group_id', flat = True) 
    grp_info = Group.objects.filter(~Q(group_id__in = readable_grp_id), title__contains = grp_keyword).order_by('-group_id').values('group_id', 'title', 'owner')
    #현재 본인이 가입되어있지 않은 그룹 목록을 group_id 기준 내림차순으로 레코드를 가져옴

    #그룹 개수로 총 페이지 수를 계산
    grp_count = len(grp_info)
    page_count = grp_count//8
    
    isExistGrp = "true"
    #그룹 개수 0인 경우
    if grp_count==0: 
        isExistGrp = "false"
        page_count=1

    #개수 1이상인데 8의 배수가 아닌 경우
    if grp_count%8!=0:
        page_count+=1 #1증가
    
    #페이지 쿼리셋 가져오기 0~7, 8~15, ... 로직
    #page number 1 : 0~7, page number 2 : 8~15...
    
    #범위 벗어난 경우 -> 마지막 페이지 참조
    if page_num<=0 or page_num>page_count:
        page_info = grp_info[(page_count-1)*8:page_count*8]
        page_num = page_count
    else: #일반적인 경우
        page_info = grp_info[(page_num-1)*8:page_num*8]
    
    #grp_info : 현재 페이지에 보여줄 그룹 정보
    #isExistGrp : 그룹이 존재하는지 여부
    #page_count : 총 페이지 수
    #page_num : 현재 가리키는 페이지 수
    context = {'grp_info' : page_info, 'isExistGrp' : isExistGrp, 'page_count' :page_count, 'page_num' :page_num, 'grp_keyword': grp_keyword }
    return render(request, './webapp/forum.html', context)

#그룹 생성으로 변경
def create_group(request):
    user = request.session.get('user')
    #title = request.POST.get('title')
    #password = request.POST.get('password')

    #post 데이터 읽기
    data = json.loads(request.body)
    title = data.get('title')
    password = data.get('password')

    #데이터 유효성 체크
    if (title == None or title == '') or (password == None or password == ''): #title 또는 password에 공백 입력
        return JsonResponse({'message': '게시글 추가에 실패했습니다.'}, status=400)

    if not re.match(r'^\d{4}$', password): #비밀번호 형식 오류
        return JsonResponse({'message': '게시글 추가에 실패했습니다.'}, status=400)

    #패스워드 해쉬
    password = pwHash.generateHashedPW(password)
    owner = User.objects.get(email = user['email'])

    #DB에 레코드 추가
    group = Group(title = title, group_password = password, owner = owner, address = "To be decided")
    grp_permission = Grp_user_permission(group_id = group, user_id = owner) #owner에게 읽기, 쓰기 권한 부여
    group.save()
    grp_permission.save()

    return JsonResponse({'message': '게시글이 추가되었습니다.'}, status=200)

#그룹 삭제로 변경
def delete_group(request):
    user = request.session.get('user')

    #post 데이터 읽기
    data = json.loads(request.body)
    grp_id = data.get('grpId')
    password = data.get('password')

    #group_id에 해당하는 레코드가 없는 경우 -> 삭제 실패
    grp = Group.objects.get(group_id = grp_id)
    if grp == None:
        return JsonResponse({'message': '그룹 삭제에 실패했습니다.'}, status=400)
    
    if user == None:
        return JsonResponse({'message': '그룹 삭제에 실패했습니다.'}, status=400)

    #해당 그룹에 대한 쓰기 권한이 없는 경우 -> 삭제 실패
    permission = Grp_user_permission.objects.get(group_id = grp_id, user_id = user['email'])
    if permission == None or not permission.writable:
        return JsonResponse({'message': '그룹 삭제에 실패했습니다.'}, status=400)
    
    #그룹 인원이 2명 이상인 경우
    memberCnt=Grp_user_permission.objects.filter(group_id = grp_id).count()
    if memberCnt>=2:
        return JsonResponse({'message': '그룹 삭제에 실패했습니다.'}, status=400)

    #비밀번호가 일치하지 않는 경우
    if not pwHash.comparePW(password, grp.group_password):
        return JsonResponse({'message': '게시글 삭제에 실패했습니다.'}, status=400)
    
    #사용자가 생성한 그룹이 아닌 경우
    if grp.owner.email != user['email']:
        permission.delete() #권한 삭제
        return JsonResponse({'message': '게시글이 삭제되었습니다.'}, status=200)

    #문서 제목 가져오기
    doc_names = load_documents(grp_id)
    #그룹 삭제
    grp.delete()
    #yorkie에 남은 문서 삭제
    for doc_name in doc_names:
        removeDocFromYorkie(doc_name)
    
    
    return JsonResponse({'message': '게시글이 삭제되었습니다.'}, status=200)

#그룹 접근 전 비밀번호 유효성 검사
def access_group(request):
    data = json.loads(request.body)
    grp_id = data.get('group_id')
    password = data.get('password')

    #group_id에 해당하는 레코드 가져오기
    grp = Group.objects.get(group_id = grp_id)
    if grp == None:
        return JsonResponse({'message': 'group이 존재하지 않습니다.'}, status=400)
    
    #해당 그룹의 비밀번호가 일치하는지 여부
    if not pwHash.comparePW(password, grp.group_password):
        return JsonResponse({'message': '비밀번호 불일치'}, status=400)
    
    return JsonResponse({'message': '비밀번호 일치'}, status=200)

#forum -> 그룹 참가 요청
def join_group(request):
    user = request.session.get('user')
    if user == None :
        return JsonResponse({'message': '세션 끊김'}, status=400)

    user = User.objects.get(email = user['email'])
    data = json.loads(request.body)
    group_id = data.get('group_id')
    group = Group.objects.get(group_id = group_id)

    if group == None:
        return JsonResponse({'message': '그룹 없음'}, status=400)

    #소유자는 안뜨도록 수정할 예정
    if group.owner == user:
        return JsonResponse({'message': '에러케이스'}, status=400)
    
    join_request = Grp_join_request.objects.filter(group_id = group, user_id = user)

    #없으면 새로 요청 레코드 생성
    if not join_request.count():
        join_request = Grp_join_request(group_id = group, user_id = user)
        join_request.save()
    else: #있으면 갱신
        join_request[0].save() #쿼리셋 1번째 요소

    return JsonResponse({'message': '그룹 참가 요청 성공'}, status=200)

#멤버 권한 관리
def manage_permission(request):
    user = request.session.get('user')
    group = request.session.get('group')

    if user == None or group == None:
        return JsonResponse({'message': '에러'}, status=400)

    if group['owner'] != user['email']: #소유자가 아닌 경우 오류
        return JsonResponse({'message': '에러'}, status=400)

    data = json.loads(request.body)
    emails = data.get('emails')
    writableList = [ value["writable"] for value in emails.values()]
    banList = [ value["ban"] for value in emails.values()]
    emails = [ email for email in emails.keys()]
    
    #강퇴할 멤버 목록
    banUsers = [ email for email,ban in zip(emails,banList) if ban]
    #writable 권한 줄 멤버 목록
    writableUsers = [ email for email,writable,ban in zip(emails,writableList,banList) if not ban and writable ]
    #writable 권한 해제할 멤버 목록
    unwritableUsers = [ email for email,writable,ban in zip(emails,writableList,banList) if not ban and not writable ]

    banUsers = Grp_user_permission.objects.filter(group_id=group['group_id'],user_id__in=banUsers)
    writableUsers = Grp_user_permission.objects.filter(group_id=group['group_id'],user_id__in=writableUsers)
    unwritableUsers = Grp_user_permission.objects.filter(group_id=group['group_id'],user_id__in=unwritableUsers)
    
    if banUsers.count()!=0:
        banUsers.delete()
    if writableUsers.count()!=0:
        writableUsers.update(writable=True)
    if unwritableUsers.count()!=0:
        unwritableUsers.update(writable=False)
    return JsonResponse({'message': '성공'}, status=200)

#멤버 요청 승인 여부
def accept_member(request):
    user = request.session.get('user')
    group = request.session.get('group')

    #둘 다 값이 있어야 한다. 
    if user == None or group == None:
        return JsonResponse({'message': '에러'}, status=400)

    data = json.loads(request.body)
    requester = data.get('requester')
    option = data.get('option')

    requester=User.objects.get(email=requester)
    group = Group.objects.get(group_id=group['group_id'])
    join_request=Grp_join_request.objects.get(group_id=group,user_id=requester)
    grp_permission = Grp_user_permission(group_id = group, user_id = requester)

    if option=="accept":
        join_request.delete()
        grp_permission.save() #그룹에 등록
        return JsonResponse({'message': '성공'}, status=200)
    elif option=="reject":
        join_request.delete()
        return JsonResponse({'message': '성공'}, status=200)
    else:
        return JsonResponse({'message': '에러'}, status=400)

def error_page(request, page):
    context = None
    if page=="mygroup":
        context = { page : True }
    elif page=="forum":
        context = { page : True }
    return render(request, './webapp/error.html', context)









#기존 코드 빼뒀습니다..
def forum_create_document(request): #forum에서 문서 생성 요청시 수행
    user = request.session.get('user')
    #title = request.POST.get('title')
    #password = request.POST.get('password')

    #post 데이터 읽기
    data = json.loads(request.body)
    title = data.get('title')
    password = data.get('password')

    #데이터 유효성 체크
    if (title == None or title == '') or (password == None or password == ''): #title 또는 password에 공백 입력
        return JsonResponse({'message': '게시글 추가에 실패했습니다.'}, status=400)

    if not re.match(r'^\d{4}$', password): #비밀번호 형식 오류
        return JsonResponse({'message': '게시글 추가에 실패했습니다.'}, status=400)

    #패스워드 해쉬
    password = pwHash.generateHashedPW(password)
    owner = User.objects.get(email = user['email'])

    #DB에 레코드 추가
    doc = Document(title = title, doc_password = password, owner = owner, address = "To be decided")
    doc_permission = Doc_user_permission(doc_id = doc, user_id = owner) #owner에게 읽기, 쓰기 권한 부여
    doc.save()
    doc_permission.save()

    return JsonResponse({'message': '게시글이 추가되었습니다.'}, status=200)

def forum_delete_document(request): #forum에서 문서 삭제 요청시 실행
    user = request.session.get('user')

    #post 데이터 읽기
    data = json.loads(request.body)
    doc_id = data.get('doc_id')
    password = data.get('password')

    #doc_id에 해당하는 레코드가 없는 경우 -> 삭제 실패
    doc = Document.objects.get(doc_id = doc_id)
    if doc == None:
        return JsonResponse({'message': '게시글 삭제에 실패했습니다.'}, status=400)
    
    #해당 문서에 대한 쓰기 권한이 없는 경우 -> 삭제 실패
    permission = Doc_user_permission.objects.get(doc_id = doc_id, user_id = user['email'])
    if permission == None or not permission.writable:
        return JsonResponse({'message': '게시글 삭제에 실패했습니다.'}, status=400)

    #비밀번호가 일치하지 않는 경우
    if not pwHash.comparePW(password, doc.doc_password):
        return JsonResponse({'message': '게시글 삭제에 실패했습니다.'}, status=400)

    doc.delete()
    return JsonResponse({'message': '게시글이 삭제되었습니다.'}, status=200)


def chat(request):
    return render(request, 'webapp/chat.html', context={})

from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from webapp.models import Group,Grp_user_permission,Grp_join_request
from django.db.models import Q
from .models import Document
from login.utils import pwHash
import json
import os

#그룹 페이지 목록
def getGroupPages():
    groupPages = ['main','entry_codepage','entry_textpage']
    return groupPages

#진입 시 그룹 세션 생성
def main(request):
    user = request.session.get('user') #현재 사용자 얻기
    group = request.session.get('group')

    if user==None:
        return redirect('/webapp/error')

    memberList=None
    join_requests=None
    group_owner=None
    isRedirect = False
    #그룹 세션 존재하는 경우
    if group!=None:
        #강퇴 등 사유 -> redirect
        grpm=Grp_user_permission.objects.filter(group_id=group['group_id'],user_id=user['email'])
        if grpm.count()==0: 
            isRedirect = True
            context = {'isRedirect': isRedirect,'grp_owner' : "", 'writable' : "",'group_id' : "", 'doc_name' : "", 'join_requests' : "", 'memberList' : ""}
            return render(request, 'codeshare/defaultPage.html',context)   
        
        grpm=Grp_user_permission.objects.get(group_id=group['group_id'],user_id=user['email'])
        writable = grpm.writable
        memberList = Grp_user_permission.objects.filter(~Q(user_id=user['email']),group_id=group['group_id']).values('user_id','writable')
        join_requests = Grp_join_request.objects.filter(group_id=group['group_id']).values('user_id','request_date')
        yorkie_doc_name = group['group_id']+"-"+"default"
        if user['email'] == group['owner']:
            group_owner = True
        else :
            group_owner = False
        context = {'isRedirect': isRedirect,'grp_owner' : group_owner, 'writable' : writable,'group_id' : group['group_id'], 'doc_name' : yorkie_doc_name, 'join_requests' : join_requests, 'memberList' : memberList}
        return render(request, 'codeshare/defaultPage.html',context)
    
    #첫 생성이라면 접근 정보 가져오기
    group_id = request.POST.get('groupId')
    password = request.POST.get('password')

    grp = Group.objects.get(group_id = group_id)
    #정상적인 접근이 아니면
    if grp == None:
        return redirect('/webapp/mygroup')
    
    #비밀번호가 일치하지 않는 경우
    if not pwHash.comparePW(password, grp.group_password):
        return redirect('/webapp/mygroup')
    
    #소속 그룹 아닌데 들어온 경우
    grpm=Grp_user_permission.objects.filter(group_id=group_id,user_id=user['email'])
    if grpm.count()==0: 
        return redirect('/webapp/mygroup')
    
    memberList = Grp_user_permission.objects.filter(~Q(user_id=user['email']),group_id=group_id).values('user_id','writable')
    join_requests = Grp_join_request.objects.filter(group_id=group_id).values('user_id','request_date')

    #group 세션 생성
    request.session['group'] = { 'group_id' : group_id, 'title' : grp.title, 'owner' : grp.owner.email, 'user' : user['email']}
    
    #DB로부터 group_id가 동일한 값들이 있는지 확인하고 없으면 기본 doc을 생성함
    docs = Document.objects.filter(group_id = group_id).values('group_id', 'doc_name')
    #만약 첫 생성이라면 DB에 default page를 만들어서 저장한 뒤 다시 docs를 구해서 반환
    if not docs.count():
        doc=Document(group_id = grp, doc_name="default")
        doc.save()
    
    yorkie_doc_name = group_id+"-"+"default"

    if user['email'] == request.session.get('group')['owner']:
        group_owner = True
    else :
        group_owner = False

    #쓰기 권한
    grpm=Grp_user_permission.objects.get(group_id=group_id,user_id=user['email'])
    writable = grpm.writable
    
    context = {'isRedirect':isRedirect,'grp_owner' : group_owner, 'writable' : writable,'group_id' : group_id ,'doc_name' : yorkie_doc_name, 'join_requests' : join_requests,'memberList':memberList}
    return render(request, 'codeshare/defaultPage.html',context)

#코드 페이지 접근
def entry_codepage(request):
    user = request.session.get('user') 
    group = request.session.get('group')

    #세션이 없는 경우 forum으로 redirect
    if (user==None) or (group==None):
        return redirect('/webapp/forum')

    group_id = group['group_id']
    doc_name = request.POST.get('doc_name')
    
    grpm=Grp_user_permission.objects.get(group_id=group_id,user_id=user['email'])
    writable = grpm.writable

    #doc_name을 조합한 뒤 반환
    yorkie_doc_name = group_id+"-"+doc_name
    
    context = {'doc_name' : yorkie_doc_name, "writable" : writable}
    return render(request, 'codeshare/codePage.html',context)    

#텍스트 페이지 접근
def entry_textpage(request):
    user = request.session.get('user') 
    group = request.session.get('group')

    #세션이 없는 경우 forum으로 redirect
    if (user==None) or (group==None):
        return redirect('/webapp/forum')

    group_id = group['group_id']
    doc_name = request.POST.get('doc_name')

    grpm=Grp_user_permission.objects.get(group_id=group_id,user_id=user['email'])
    writable = grpm.writable
    
    #doc_name을 조합한 뒤 반환
    yorkie_doc_name = group_id+"-"+doc_name
    
    context = {'doc_name' : yorkie_doc_name, "writable" : writable}
    return render(request, 'codeshare/textPage.html',context)     

#문서 생성
def create_document(request):
    user = request.session.get('user')
    group = request.session.get('group')

    if (user==None) or (group==None) :
        return JsonResponse({'message': '문서 생성에 실패했습니다.'}, status=400)

    #post 데이터 읽기
    data = json.loads(request.body)
    doc_name = data.get('doc_name')
    doc_type = data.get('doc_type')

    docs = Document.objects.filter(group_id = group['group_id'],doc_name=doc_name).values('group_id', 'doc_name')
    if docs.count(): #1개 이상 존재하면 생성 불가
        return JsonResponse({'message': '문서 생성에 실패했습니다.'}, status=400)

    grp = Group.objects.get(group_id = group['group_id']);
    #docs가 0개인 경우에 대해서 문서를 생성
    doc = Document(group_id = grp, doc_name=doc_name, doc_type=doc_type)
    doc.save()
    return JsonResponse({'message': '문서를 생성했습니다.'}, status=200)

#문서 삭제
def delete_document(request):
    user = request.session.get('user')
    group = request.session.get('group')

    if (user==None) or (group==None) :
        return JsonResponse({'message': '문서 삭제에 실패했습니다.'}, status=400)
    
    #post 데이터 읽기
    data = json.loads(request.body)
    doc_name = data.get('doc_name')
    group_id = group['group_id']

    #권한에 대한 옵션은 추후 추가

    #기본문서는 삭제 불가
    if doc_name == "default":
        return JsonResponse({'message': '문서 삭제에 실패했습니다.'}, status=400)

    #group_id, doc_name에 해당하는 문서를 추출
    doc = Document.objects.get(group_id = group_id,doc_name=doc_name)
    if doc == None:
        return JsonResponse({'message': '문서 삭제에 실패했습니다.'}, status=400)

    #yorkie에 생성된 문서 삭제
    docName = group_id+"-"+doc.doc_name 
    removeDocFromYorkie(docName)
    #DB에서 삭제
    doc.delete()
    return JsonResponse({'message': '문서가 삭제되었습니다.'}, status=200)

#yorkie 문서 삭제 명령
def removeDocFromYorkie(docName): 
    cmmd = "yorkie login -u xdaxda0304 -p !xdacp8475 --rpc-addr api.yorkie.dev:443"
    cmmd += "&yorkie document remove lcd-project "+docName+" --force"
    cmmd += "&yorkie logout"
    return os.system(cmmd)

#문서 로드
def load_documents(group_id):
    docs = Document.objects.filter(group_id = group_id).values('group_id', 'doc_name')
    doc_lists = []
    for doc in docs:
        doc_lists.append(f"{doc['group_id']}-{doc['doc_name']}")
    return doc_lists

#그룹 세션 삭제 코드
def delete_group_session(request):
    try:
        request.session.modified = True
        del request.session['group'] #그룹 세션 삭제
    except:
        pass
    group = request.session.get('group')
    if group == None:
        return True
    else :
        return False

#그룹 페이지에 속하는지 체크 - url이 그룹에 속하지 않으면 세션을 끊습니다..
def checkInGroup(request):
    user = request.session.get('user')
    if user == None:
        delete_group_session(request)
        return JsonResponse({'message': '세션 끊김'}, status=400)
    
    group = request.session.get('group')
    if group == None:
        return JsonResponse({'message' : '세션 끊김'}, status=400)
    
    data = json.loads(request.body)
    url = data.get('url')
    
    #url에 안에 groupPage가 하나라도 매칭이 안되면 세션을 끊는다
    if not any(page in url for page in getGroupPages()):
        delete_group_session(request)
        return JsonResponse({'message' : '세션 끊김'}, status=400)
    
    #세션이 존재하는 경우 title, docs를 만들어보내기
    group_id = group['group_id']
    grp = Group.objects.get(group_id = group_id)
    title = grp.title
    docs = Document.objects.filter(group_id = group_id).values('group_id', 'doc_name','doc_type')
    jsonData = {'title' : title}
    doc_names = []
    doc_types = []
    for doc in docs:
        doc_names.append(doc['doc_name'])
        doc_types.append(doc['doc_type'])
    jsonData['doc_names'] = doc_names
    jsonData['doc_types'] = doc_types
    return JsonResponse(jsonData, status=200)
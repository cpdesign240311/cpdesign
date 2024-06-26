//페이지 이동 관련
function moveToHead(){
    redirectPage(1);
}

function moveToTail(){
    redirectPage(-1);
}

function moveToPre(page_num){
    redirectPage(parseInt(page_num)-1);
}

function moveToNext(page_num){
    redirectPage(parseInt(page_num)+1);
}

function redirectPage(page_num){
    let form = document.createElement("form");
    form.setAttribute("id","hform");
    form.setAttribute("charset","UTF-8");
    form.setAttribute("method","POST");
    form.setAttribute("action",getHost()+'/webapp/forum');
    
    let hiddenField = null;
    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type","hidden");
    hiddenField.setAttribute("name","page_num");
    hiddenField.setAttribute("value",page_num);
    form.appendChild(hiddenField);    

    //form에 그룹 검색어 추가
    let grpSearch = document.getElementById("grpSearch");
    let grpSearchClone = grpSearch.cloneNode(true);
    form.appendChild(grpSearchClone); 
    
    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type","hidden");
    hiddenField.setAttribute("name","csrfmiddlewaretoken");
    hiddenField.setAttribute("value",getCookie('csrftoken'));
    form.appendChild(hiddenField);

    document.body.appendChild(form);
    form.submit();
    document.getElementById("hform").remove();
}

//그룹 참가 요청
function requestJoinGroup(group_id){
    const post = { group_id }
    fetch(getHost()+"/webapp/forum/join_group",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(post)
    })
    .then(response=>{
        if (response.ok) {
            console.log("요청 성공");
        } else {
            console.log("요청 실패");
        }
    })
    .catch(error =>{
        console.error('Error:', error);
    })
}

//그룹 검색창에서 엔터키 입력 시 실행
function grp_search(event){
    if (event.key === "Enter" || event.type === "click"){
        redirectPage(1);
    }
}
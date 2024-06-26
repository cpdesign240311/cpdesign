/*
iframe의 url이 그룹 페이지에 속하는지, 세션이 활성화 
되어있는지 확인 후 둘 다 만족한다면 리스트를 출력합니다.
*/
function loadList(url){
    const post={ url };
    let host=getHost();
    //url이 그룹 페이지인지 확인합니다
    fetch(host+"/codeshare/check_in_group", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
        },
        body: JSON.stringify(post)
    })
    .then(response => {
        if (response.ok && response.status == 200) {
            return response.json();
        } else {
            delDocList(); //리스트 없애기
        }
    })
    .then((json)=>{
        if(typeof json !="undefined")
            addDocList(json.title,json.doc_names,json.doc_types);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//리스트 추가
function addDocList(title,doc_names,doc_types){
    let doc_list = document.getElementById("doc_list");
    let htmlString = `[${title}]`;
    let defaultPage = getHost()+'/codeshare/main';
    let codePage = getHost()+'/codeshare/entry_codepage';
    let textPage = getHost()+'/codeshare/entry_textpage';
    
    for(let i=0;i<doc_names.length;i++){
        let page=null;
        if(doc_types[i]=="code")
            page = codePage;
        else if(doc_types[i]=="text")
            page = textPage;
        else
            page = defaultPage;
        htmlString += `<li><a href="javascript:void(0);" onclick="changeIframePage('${page}','${doc_names[i]}');">${doc_names[i]}</li>`;
    }
    //나가기 버튼 추가
    htmlString += `<br><a href="javascript:void(0);" style="color : red; font-weight:bold; text-decoration-line: none;" onclick="outOfGroup()">나가기</a>`
    doc_list.innerHTML = htmlString
}

//리스트 삭제
function delDocList(){
    let doc_list = document.getElementById("doc_list");
    doc_list.innerHTML = "";
}

//iframe의 페이지를 변경합니다.
//function overloading
function changeIframePage(url,doc_name){
    let iframe = document.getElementById("mainFrame").name 
    let form = document.createElement("form");
    form.setAttribute("id","hform");
    form.setAttribute("charset","UTF-8");
    form.setAttribute("target",iframe);
    form.setAttribute("action",url);
    
    let hiddenField = null;
    if(doc_name){ //doc_name이 있을 경우에만 이름 추가
        form.setAttribute("method","POST");
        hiddenField = document.createElement("input");
        hiddenField.setAttribute("type","hidden");
        hiddenField.setAttribute("name","doc_name");
        hiddenField.setAttribute("value",doc_name);
        form.appendChild(hiddenField);    

        hiddenField = document.createElement("input");
        hiddenField.setAttribute("type","hidden");
        hiddenField.setAttribute("name","csrfmiddlewaretoken");
        hiddenField.setAttribute("value",getCookie('csrftoken'));
        form.appendChild(hiddenField);
    }
    else
        form.setAttribute("method","GET");
    document.body.appendChild(form);
    form.submit();
    document.getElementById("hform").remove();
}

function getDocList(){
    let mainFrame = document.getElementById("mainFrame");
    let url = new String(mainFrame.contentWindow.location.href); 
    loadList(url.valueOf());
}

//mygroup 페이지로 이동합니다.
function outOfGroup(){
    document.getElementById("mygroupLink").click();
}
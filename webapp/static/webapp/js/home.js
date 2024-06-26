//home의 링크 처리에 관한 js
function linkingEvent(){
    let forum = document.getElementById("forumLink");
    let mygroup = document.getElementById("mygroupLink");
    let host = getHost();
    localStorage.clear();
    forum.addEventListener('click',()=>{
        let url = host+"/webapp/forum";
        window.dconnBroadCast(); //소켓 연결 끊기 요청
        window.delDocList();
        changeIframePage(url);
    });
    mygroup.addEventListener('click',()=>{
        let url = host+"/webapp/mygroup";
        window.dconnBroadCast();
        window.delDocList();
        changeIframePage(url);
    });
}
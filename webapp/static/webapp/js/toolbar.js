//팝업 툴바 조작

//UI
var nav = document.querySelector('nav');
var lineOne = document.querySelector('nav .menu-btn .line--1');
var lineTwo = document.querySelector('nav .menu-btn .line--2');
var lineThree = document.querySelector('nav .menu-btn .line--3');
var navLinks = document.querySelector('nav .nav-links');

// 페이지 로드 시 자식의 투명도를 0으로 설정
function toolBarLoadEvent(){
    navLinks.querySelectorAll('.link').forEach(function(link) {
        link.style.opacity = 0;
    }); 
    //채팅에 대해서도 동일 css 적용
    document.getElementById("chatBtn").style.opacity = 0;
}

// 버튼 애니메이션
function toolBarClickEvent(){
    nav.classList.toggle('nav-open');
    lineOne.classList.toggle('line-cross');
    lineTwo.classList.toggle('line-fade-out');
    lineThree.classList.toggle('line-cross');

    // nav-open 클래스가 추가되면 자식의 투명도를 조절
    if (nav.classList.contains('nav-open')) {
        navLinks.querySelectorAll('.link').forEach(function(link) {
            link.style.opacity = 1;
            link.style.transition = 'opacity 0.5s ease';
            //채팅 투명도 변경
            document.getElementById("chatBtn").style.opacity = 1;
        });
    } else {
        navLinks.querySelectorAll('.link').forEach(function(link) {
            link.style.opacity = 0;
            link.style.transition = 'opacity 0.5s ease';
            //채팅 투명도 변경
            document.getElementById("chatBtn").style.opacity = 0;
        });
    }
}

function toolBarKeyEvent(e){
    if(e.key=="Escape" || e.key=="Esc"){
        e.preventDefault();
        toolBarClickEvent();
    }
}

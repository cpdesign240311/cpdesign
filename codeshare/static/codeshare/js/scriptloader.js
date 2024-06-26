function loadScript(src){
    let section = document.getElementById("content");
    let script = document.createElement("script");
    script.setAttribute("type","module");
    script.setAttribute("src",src);
    section.appendChild(script);
}
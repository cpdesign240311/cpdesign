var chatWindow = null;

function openChattingWindow() { 
    if(chatWindow == null || chatWindow.closed){
        let windowWidth = 400;
        let windowHeight = 600;
        let leftPosition = (screen.width) ? (screen.width - windowWidth) / 2 : 0;
        let topPosition = (screen.height) ? (screen.height - windowHeight) / 2 : 0;
        let windowFeatures = 'width=' + windowWidth + ',height=' + windowHeight + ',top=' + topPosition + ',left=' + leftPosition + 
            ',toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no';
        chatWindow = window.open("http://" + window.location.hostname + ":2020/", 'popup2', windowFeatures);
    }
    else {
        chatWindow.focus();
    }
}

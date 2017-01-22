function init() {
    cleanPage();
    enableComments();
    addListeners();
    chromeStorage.getCombinedSettings().then(data=>{
        setStyle(data.style.color);
        if(data.settings.notes) {
            createIframe(data);
        }
        prepareData(true);
        var continuousTimer;
        if(data.settings.bookmarks)
        {
            sendBookmarksRequest();
            var initialTimer = setInterval(function () {
                timer("Initial Links Render Attempt");
                if (document.readyState === "complete" || document.readyState==="interactive") {
                    firstRunDisplay();
                    clearInterval(initialTimer)
                }
            }, 100);
            continuousTimer = setInterval(function () {
                if(document.hasFocus()) {
                    refreshDisplay()
                }
            },5000);
        }
        return continuousTimer;
    }).then(timer=>{
        function settingsChangeListener(msg, sender, sendResponse) {
            if ((msg.from === 'popup' && msg.type == 'settings_change')||(msg.from === 'frame' && msg.type == 'delete_bookmark')) {
                chrome.runtime.onMessage.removeListener(settingsChangeListener);
                if(timer) {
                    clearInterval(timer)
                }
                init();
            }
        }
        chrome.runtime.onMessage.addListener(settingsChangeListener);
    })
}

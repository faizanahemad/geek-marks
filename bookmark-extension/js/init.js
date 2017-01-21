function init() {
    cleanPage();
    enableComments();
    addListeners();
    chromeStorage.getCombinedSettings().then(data=>{
        if(data.settings.notes) {
            createIframe(data);
        }
        prepareData(true);
        var continuousTimer;
        if(data.settings.bookmarks)
        {
            setStyle(data.style.color);
            sendBookmarksRequest();
            var initialTimer = setInterval(function () {
                if (document.readyState === "complete" || document.readyState==="interactive") {
                    timer("Initial Links Render Attempt");
                    refreshDisplay(true);
                    clearInterval(initialTimer)
                }
            }, 150);
            continuousTimer = setInterval(function () {
                if(document.hasFocus()) {
                    refreshDisplay(false)
                }
            },5000);
        }
        return continuousTimer;
    }).then(timer=>{
        function settingsChangeListener(msg, sender, sendResponse) {
            if (msg.from === 'popup' && msg.type == 'settings_change') {
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

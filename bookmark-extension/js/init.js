function init() {
    cleanPage();
    enableComments();
    var resources = addListeners();
    chromeStorage.getCombinedSettings().then(data=>{
        setStyle(data.style.color);
        if(data.settings.notes) {
            createIframe(data);
        }
        prepareData(true);
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
        }
        return resources;
    }).then(resources=>{
        var locationTimer;
        function settingsChangeListener(msg, sender, sendResponse) {
            if ((msg.from === 'popup' && msg.type == 'settings_change')||(msg.from === 'frame' && msg.type == 'delete_bookmark')) {
                clearResources(resources);
                init();
            }
        }
        chrome.runtime.onMessage.addListener(settingsChangeListener);
        resources.listeners.push(settingsChangeListener);
        var curHref = location.href;
        locationTimer = setInterval(()=>{
            if(location.href!==curHref) {
                clearResources(resources);
                init();
            }
        },500);
        resources.timers.push(locationTimer);
        return timer;
    })
}

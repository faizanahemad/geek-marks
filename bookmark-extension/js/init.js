function init(settings) {
    if(typeof settings==="undefined") {
        settings = chromeStorage.getCombinedSettings()
    }
    storage.initCache()
    var resources = addListeners();
    var bookmarksReq=sendBookmarksRequest();
    var preparedData = prepareData(true)
    g4gSpecific();
    settings.then(data=>{
        setStyle(data.style.color);
        if(data.settings.notes) {
            createIframe(data);
        }
        
        if(data.settings.bookmarks)
        {
            bookmarksReq.then(doc=>{
                renderBookmarkLinks(doc.bookmarks)
            });
            var initialTimer = false;
            function initialRunner() {
                if (document.readyState === "complete" || document.readyState==="interactive") {
                    // for firstRunDisplay when we are going to use all features, color links and show bookmarks
                    preparedData.then(()=>{
                        youtubeTimeCapture();
                        renderLinks();
                    });
                    if(initialTimer) {
                        clearInterval(initialTimer)
                    }
                }
            }
            initialRunner()
            initialTimer = setInterval(initialRunner, 50);
        }
        return resources;
    }).then(resources=>{
        var locationTimer;
        function settingsChangeListener(msg, sender, sendResponse) {
            if ((msg.from === 'popup' && msg.type == 'settings_change')||
                (msg.from === 'frame' && msg.type == 'delete_bookmark')||
                (msg.from==="storage_proxy_failure" && msg.type==="storage_failure")) {
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
                setTimeout(()=>init(),1000);
            }
        },100);
        resources.timers.push(locationTimer);
        return resources;
    })
}

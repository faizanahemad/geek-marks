function init() {
    storage.initCache()
    g4gSpecific();
    var resources = addListeners();
    chromeStorage.getCombinedSettings().then(data=>{
        setStyle(data.style.color);
        if(data.settings.notes) {
            createIframe(data);
        }
        
        if(data.settings.bookmarks)
        {
            sendBookmarksRequest();
            var initialTimer = false;
            function initialRunner() {
                if (document.readyState === "complete" || document.readyState==="interactive") {
                    firstRunDisplay();
                    if(initialTimer) {
                        clearInterval(initialTimer)
                    }
                }
            }
            initialRunner()
            initialTimer = setInterval(initialRunner, 50);
        } else {
            prepareData(true);
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

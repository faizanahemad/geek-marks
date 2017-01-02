function init() {
    cleanPage();
    enableComments();
    addListeners();
    chromeStorage.getCombinedSettings().then(data=>{
        if(data.settings.notes) {
            createIframe(data);
        }
        prepareData(true);
        if(data.settings.bookmarks) {
            sendBookmarksRequest();
            var initialTimer = setInterval(function () {
                if (document.readyState === "complete" || document.readyState==="interactive") {
                    timer("Initial Links Render Attempt");
                    refreshDisplay(true);
                    clearInterval(initialTimer)
                }
            }, 100);
            setInterval(function () {
                isSelected().then((msg)=>{
                    if(msg && msg.active) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject();
                    }
                }).then(()=>refreshDisplay(false), (err)=>{});
            },5000);
        }
    })
}

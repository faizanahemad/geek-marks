function init() {
    cleanPage();
    enableComments();
    addListeners();
    createIframe();
    sendUserIdRequest();
    sendBookmarksRequest();
    var initialTimer = setInterval(function () {
        if (document.readyState === "complete" || document.readyState==="interactive") {
            timer("Initial Links Render Attempt");
            refreshData(true).then(()=>{

            },console.error);
            clearInterval(initialTimer)
        }
    }, 200);
    setInterval(function () {
        isSelected().then((msg)=>{
            if(msg && msg.active) {
                return Promise.resolve();
            } else {
                return Promise.reject();
            }
        }).then(()=>refreshData(false),(err)=>{});
    },5000);
}

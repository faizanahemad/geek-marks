function init() {
    cleanPage();
    enableComments();
    addListeners();
    createIframe();
    sendBookmarksRequest();
    var initialTimer = setInterval(function () {
        if (document.readyState === "complete" || document.readyState==="interactive") {
            refreshData(true);
            clearInterval(initialTimer);
        }
    }, 100);
    setInterval(function () {
        refreshData(false);
    },5000);
}

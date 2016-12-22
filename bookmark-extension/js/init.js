function init() {
    cleanPage();
    enableComments();
    addListeners();
    createIframe();
    sendBookmarksRequest();
    setTimeout(function () {
        refreshData(true)
    }, 1000);
    setInterval(function () {
        refreshData(false);
    },5000);
}

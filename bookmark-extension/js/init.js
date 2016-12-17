function init() {
    createColorButtons();
    changeStyle(4);
    createBrowseButton();
    createShowHideButton();
    createNoteArea();
    createTagArea();
    cleanPage();
    enableComments();
    setTimeout(function () {
        refreshData(true)
    }, 1000);
    setInterval(function () {
        refreshData(false);
    },5000);
}
